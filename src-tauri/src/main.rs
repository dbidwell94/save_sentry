// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    path::Path,
    sync::{Arc, Mutex, OnceLock, RwLock},
};
use tauri::api::dialog;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayMenu, Window};

mod config;
mod file_handler;
mod file_listener;

lazy_static::lazy_static! {
    pub static ref DIRS: directories::ProjectDirs = directories::ProjectDirs::from("", "Biddydev", "SaveSentry").unwrap();
}

pub static WINDOW: OnceLock<Window> = OnceLock::new();

type ConfigState = Arc<RwLock<config::ProgramConfig>>;

#[tauri::command]
fn add_game(
    game_name: String,
    save_folder_path: String,
    max_save_backups: u32,
    config: tauri::State<'_, ConfigState>,
    file_watcher: tauri::State<'_, Mutex<file_listener::FileWatcher>>,
    window: tauri::Window,
) -> Result<(), String> {
    let mut config = config.write().map_err(|e| e.to_string())?;

    // ensure this folder path has not already been added to the config
    if config
        .games
        .values()
        .any(|g| g.save_folder_path == save_folder_path)
    {
        return Err("This save path has already been added".to_string());
    }

    // ensure this save path has not already been added to the config

    file_watcher
        .lock()
        .unwrap()
        .watch_new_game(Path::new(&save_folder_path))
        .unwrap();

    let game_config = config::GameConfig {
        game_name: game_name.clone(),
        save_folder_path,
        max_save_backups,
        watcher_enabled: true,
        save_files: vec![],
        id: uuid::Uuid::new_v4().to_string(),
    };

    config.games.insert(game_name, game_config);
    config
        .save()
        .map_err(|_| "Failed to save config".to_string())?;

    window
        .emit("configUpdated", ())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn remove_game(
    game_id: String,
    config_state: tauri::State<'_, ConfigState>,
    file_watcher: tauri::State<'_, Mutex<file_listener::FileWatcher>>,
    window: tauri::Window,
) -> Result<(), String> {
    {
        let config = config_state.read().map_err(|e| e.to_string())?;
        let game_config = config
            .games
            .values()
            .find(|g| g.id == game_id)
            .ok_or_else(|| "Unable to find game config")?;
        let mut file_watcher = file_watcher.lock().map_err(|e| e.to_string())?;

        file_watcher
            .stop_watching(Path::new(&game_config.save_folder_path))
            .map_err(|e| e.to_string())?;
    }

    // delete all backed up save files
    file_handler::delete_backup_directory(&config_state, &game_id).map_err(|e| e.to_string())?;

    let mut config = config_state.write().map_err(|e| e.to_string())?;

    config.games.retain(|_, g| g.id != game_id);
    config
        .save()
        .map_err(|_| "Failed to save config".to_string())?;
    window
        .emit("configUpdated", ())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_config(config: tauri::State<'_, ConfigState>) -> Result<config::ProgramConfig, String> {
    Ok(config.read().map_err(|e| e.to_string())?.clone())
}

#[tauri::command]
fn change_config(
    current_config: tauri::State<'_, ConfigState>,
    new_config: config::ProgramConfig,
    window: tauri::Window,
) -> Result<(), String> {
    let mut config = current_config.write().map_err(|e| e.to_string())?;
    *config = new_config;
    config.save().map_err(|e| e.to_string())?;
    window
        .emit("configUpdated", ())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn open_folder_browser(window: tauri::Window) {
    dialog::FileDialogBuilder::default().pick_folder(move |path| {
        println!("Selected path: {:?}", path);
        _ = window.emit("selected_folder", path);
    });
}

#[tauri::command]
fn restore_save(
    game_id: String,
    save_id: String,
    config: tauri::State<'_, ConfigState>,
    file_watcher: tauri::State<'_, Mutex<file_listener::FileWatcher>>,
) -> Result<(), String> {
    let mut watcher = file_watcher.lock().map_err(|e| e.to_string())?;
    file_handler::restore_save_directory(config.inner(), &game_id, &save_id, &mut watcher)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn delete_save(
    game_id: String,
    save_id: String,
    config: tauri::State<'_, ConfigState>,
) -> Result<(), String> {
    file_handler::delete_save(config.inner(), &game_id, &save_id).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn toggle_game_file_watcher(
    game_id: String,
    enabled: bool,
    config: tauri::State<'_, ConfigState>,
    file_watcher: tauri::State<'_, Mutex<file_listener::FileWatcher>>,
    window: tauri::Window,
) -> Result<(), String> {
    let mut watcher = file_watcher.lock().map_err(|e| e.to_string())?;
    let mut config = config.write().map_err(|e| e.to_string())?;

    let game_config = config
        .games
        .values_mut()
        .find(|g| g.id == game_id)
        .ok_or_else(|| "Unable to find game config")?;

    if enabled == game_config.watcher_enabled {
        return Ok(());
    }

    let game_path = Path::new(&game_config.save_folder_path);

    if enabled {
        watcher
            .watch_new_game(game_path)
            .map_err(|e| e.to_string())?;
    } else {
        watcher
            .stop_watching(game_path)
            .map_err(|e| e.to_string())?;
    }

    game_config.watcher_enabled = enabled;
    config.save().map_err(|e| e.to_string())?;
    window
        .emit("configUpdated", ())
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn main() -> anyhow::Result<()> {
    let program_config = Arc::new(RwLock::new(
        config::ConfigVersion::load()?.perform_migrations()?,
    ));

    let quit = CustomMenuItem::new("quit", "Quit");
    let toggle_show = CustomMenuItem::new("toggle_show", "Restore/Hide");
    let tray_menu = SystemTrayMenu::new().add_item(toggle_show).add_item(quit);

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            tauri::SystemTrayEvent::MenuItemClick { id, .. } => {
                if id == "quit" {
                    app.exit(0);
                }
                if id == "toggle_show" {
                    let window = app.get_window("main").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                    }
                }
            }
            _ => {}
        })
        .on_window_event(|evt| match evt.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                evt.window().hide().unwrap();
            }
            _ => {}
        })
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            _ = WINDOW.set(window);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            add_game,
            remove_game,
            get_config,
            change_config,
            open_folder_browser,
            restore_save,
            delete_save,
            toggle_game_file_watcher
        ])
        .manage(program_config.clone())
        .manage(Mutex::new(file_listener::FileWatcher::new(program_config)?))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
