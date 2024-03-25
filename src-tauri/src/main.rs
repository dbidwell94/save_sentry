// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    path::Path,
    sync::{Mutex, OnceLock},
};

use tauri::{Manager, Window};

mod config;
mod file_listener;

pub static WINDOW: OnceLock<Window> = OnceLock::new();

#[tauri::command]
fn add_game(
    game_name: String,
    save_folder_path: String,
    max_save_backups: u32,
    config: tauri::State<'_, Mutex<config::ProgramConfig>>,
    file_watcher: tauri::State<'_, Mutex<file_listener::FileWatcher>>,
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
        save_files: vec![],
    };

    let mut config = config.lock().map_err(|e| e.to_string())?;

    config.games.insert(game_name, game_config);
    config.save().unwrap();

    Ok(())
}

#[tauri::command]
fn get_config(
    config: tauri::State<'_, Mutex<config::ProgramConfig>>,
) -> Result<config::ProgramConfig, String> {
    Ok(config.lock().map_err(|e| e.to_string())?.clone())
}

#[tauri::command]
fn change_config(
    current_config: tauri::State<'_, Mutex<config::ProgramConfig>>,
    new_config: config::ProgramConfig,
) -> Result<(), String> {
    let mut config = current_config.lock().map_err(|e| e.to_string())?;
    *config = new_config;
    config.save().map_err(|e| e.to_string())?;
    Ok(())
}

fn main() -> anyhow::Result<()> {
    let program_config = config::ProgramConfig::load()?;
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            _ = WINDOW.set(window);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            add_game,
            get_config,
            change_config
        ])
        .manage(Mutex::new(program_config.clone()))
        .manage(Mutex::new(file_listener::FileWatcher::new(program_config)?))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
