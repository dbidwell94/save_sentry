use std::{
    path::Path,
    sync::{Arc, RwLock},
};

use crate::{
    config::{ProgramConfig, SaveFileMetadata},
    DIRS,
};

pub fn backup_directory(
    root_dir: &Path,
    game_name: &str,
    max_save_backups: u32,
    program_config: Arc<RwLock<ProgramConfig>>,
) -> anyhow::Result<()> {
    let mut config = program_config.write().unwrap();

    let game_dir = DIRS.data_dir().join(game_name);

    println!(
        "Backing up game {game_name} from directory {:?} to directory {game_dir:?}",
        root_dir
    );

    // check if the data directory exists. If not, create it
    if !game_dir.exists() {
        std::fs::create_dir_all(&game_dir).unwrap();
    }

    let now = chrono::Local::now().timestamp().to_string();

    // get a list of all the folders in the game directory
    let mut folders: Vec<_> = std::fs::read_dir(&game_dir)
        .unwrap()
        .map(|entry| entry.unwrap().path())
        .collect();

    // check if the count is at or above the max save backups
    if folders.len() >= max_save_backups as usize {
        // sort the folders by date modified
        folders.sort_by_key(|f| {
            std::fs::metadata(f)
                .unwrap()
                .modified()
                .unwrap()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
        });

        // remove the oldest folder
        std::fs::remove_dir_all(&folders[0]).unwrap();

        // remove the oldest save file from the config
        _ = config
            .games
            .get_mut(game_name)
            .unwrap()
            .save_files
            .remove(0);
    }

    let save_dir = game_dir.join(&now);
    println!("Creating new save directory at {:?}", save_dir);

    // make new directory for the current backup, under /game_dir/<gameName>/<now>
    std::fs::create_dir_all(&save_dir).unwrap();

    fn copy_recursive(src: &Path, dest: &Path) -> anyhow::Result<()> {
        if src.is_dir() {
            if !dest.exists() {
                std::fs::create_dir_all(dest)?;
            }

            for entry in std::fs::read_dir(src)? {
                let entry = entry?;
                let path = entry.path();
                let new_dest = dest.join(path.file_name().unwrap());
                copy_recursive(&path, &new_dest)?;
            }
        } else {
            std::fs::copy(src, dest)?;
        }

        Ok(())
    }

    copy_recursive(root_dir, &save_dir)?;

    // lock program config
    config
        .games
        .get_mut(game_name)
        .unwrap()
        .save_files
        .push(SaveFileMetadata {
            created_at: chrono::Local::now().to_rfc2822(),
            save_id: now,
            updated_at: chrono::Local::now().to_rfc2822(),
        });

    config.save().unwrap();
    crate::WINDOW
        .get()
        .unwrap()
        .emit("configUpdated", ())
        .unwrap();

    Ok(())
}
