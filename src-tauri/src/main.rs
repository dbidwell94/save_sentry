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

    let mut config = config.write().map_err(|e| e.to_string())?;

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
            get_config,
            change_config,
            open_folder_browser
        ])
        .manage(program_config.clone())
        .manage(Mutex::new(file_listener::FileWatcher::new(program_config)?))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
