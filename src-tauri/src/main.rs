// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

mod config;

#[tauri::command]
fn add_game(
    game_name: String,
    save_folder_path: String,
    max_save_backups: u32,
    config: tauri::State<'_, Mutex<config::ProgramConfig>>,
) -> Result<(), String> {
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

fn main() -> anyhow::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_game])
        .manage(Mutex::new(config::ProgramConfig::load()?))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
