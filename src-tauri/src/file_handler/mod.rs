use crate::{
    config::{ProgramConfig, SaveFileMetadata},
    file_listener::FileWatcher,
    DIRS,
};
use sha2::{
    digest::{
        consts::{B0, B1},
        core_api::{CoreWrapper, CtVariableCoreWrapper},
        generic_array::GenericArray,
        typenum::{UInt, UTerm},
    },
    Digest, Sha256, Sha256VarCore,
};
use std::{
    io::Read,
    path::{Path, PathBuf},
    str::FromStr,
    sync::{Arc, RwLock},
};

pub type Hasher = CoreWrapper<
    CtVariableCoreWrapper<
        Sha256VarCore,
        UInt<UInt<UInt<UInt<UInt<UInt<UTerm, B1>, B0>, B0>, B0>, B0>, B0>,
        Sha256,
    >,
>;
pub type Hash = GenericArray<u8, UInt<UInt<UInt<UInt<UInt<UInt<UTerm, B1>, B0>, B0>, B0>, B0>, B0>>;

pub fn calculate_directory_checksum_recursive(
    directory: &Path,
    hasher: &mut Hasher,
) -> anyhow::Result<()> {
    // create a fixed buffer to read files into with a size of 1kb
    let mut buffer = vec![0; 1024];
    for entry in std::fs::read_dir(directory)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            calculate_directory_checksum_recursive(&path, hasher)?;
        } else {
            let file = std::fs::File::open(&path)?;
            let mut reader = std::io::BufReader::new(file);

            // read the file in chunks of 1kb
            loop {
                let bytes_read = reader.read(&mut buffer)?;
                if bytes_read == 0 {
                    break;
                }

                hasher.update(&buffer[..bytes_read]);
            }
        }
    }

    Ok(())
}

/// Backup a directory to the game's save directory.
/// Compares the current directory to the latest save directory and only saves if there are changes
pub fn backup_directory(
    root_dir: &Path,
    game_name: &str,
    max_save_backups: u32,
    program_config: Arc<RwLock<ProgramConfig>>,
) -> anyhow::Result<()> {
    let mut config = program_config
        .write()
        .map_err(|_| anyhow::anyhow!("Unable to aquire write lock on program config"))?;

    let game_dir = DIRS.data_dir().join(game_name);

    println!(
        "Got request to back up {game_name} save from directory {0:#?} to directory {1:#?}",
        root_dir.as_os_str(),
        game_dir.as_os_str()
    );

    // check if the data directory exists. If not, create it
    if !game_dir.exists() {
        std::fs::create_dir_all(&game_dir)?;
    }

    let now = chrono::Local::now().timestamp().to_string();

    // get a list of all the folders in the game directory
    let mut folders = std::fs::read_dir(&game_dir)?
        .map(|entry| entry.expect("DirEntry not valid").path())
        .collect::<Vec<_>>();

    // sort the folders by date modified
    folders.sort_by_key(|f| {
        std::fs::metadata(f)
            .expect("Unable to read file metadata")
            .modified()
            .expect("Unable to get modified time")
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Unable to get duration since epoch")
    });

    // check if the count is at or above the max save backups
    if folders.len() >= max_save_backups as usize {
        // remove the oldest folder
        std::fs::remove_dir_all(&folders[0])?;

        // remove the oldest save file from the `folders` list
        folders.remove(0);

        // remove the oldest save file from the config
        _ = config
            .games
            .get_mut(game_name)
            .ok_or_else(|| {
                anyhow::anyhow!("Game config does not exist. This is an unexpected error")
            })?
            .save_files
            .remove(0);
    }

    // get hash of root dir
    let mut hasher = Hasher::default();
    calculate_directory_checksum_recursive(root_dir, &mut hasher)?;
    let hash: Hash = hasher.finalize();

    let current_game_config = config.games.get(game_name).ok_or_else(|| {
        anyhow::anyhow!("Game config does not exist. This is an unexpected error")
    })?;

    let should_save = !current_game_config
        .save_files
        .iter()
        .any(|f| f.hash == hash);

    if !should_save {
        println!("Save state detected as unchanged and/or already backed up. Skipping save.");
        return Ok(());
    }

    let save_dir = game_dir.join(&now);
    println!("Creating new save directory at {:?}", save_dir);

    // make new directory for the current backup, under /game_dir/<gameName>/<now>
    std::fs::create_dir_all(&save_dir)?;

    fn copy_recursive(src: &Path, dest: &Path) -> anyhow::Result<()> {
        if src.is_dir() {
            if !dest.exists() {
                std::fs::create_dir_all(dest)?;
            }

            for entry in std::fs::read_dir(src)? {
                let entry = entry?;
                let path = entry.path();
                let new_dest = dest.join(
                    path.file_name()
                        .ok_or_else(|| anyhow::anyhow!("Unable to get file name"))?,
                );
                copy_recursive(&path, &new_dest)?;
            }
        } else {
            std::fs::copy(src, dest)?;
        }

        Ok(())
    }

    copy_recursive(root_dir, &save_dir)?;

    let mut hasher = Hasher::default();
    calculate_directory_checksum_recursive(&save_dir, &mut hasher)?;
    let hash = hasher.finalize();

    // lock program config
    config
        .games
        .get_mut(game_name)
        .ok_or_else(|| anyhow::anyhow!("Game config does not exist. This is an unexpected error"))?
        .save_files
        .push(SaveFileMetadata {
            created_at: chrono::Local::now().to_rfc2822(),
            save_id: now,
            hash,
        });

    config.save()?;
    crate::WINDOW
        .get()
        .ok_or_else(|| anyhow::anyhow!("Window not initialized"))?
        .emit("configUpdated", ())?;

    Ok(())
}

/// Restore a save directory to the game's save directory.
pub fn restore_save_directory(
    program_config: &Arc<RwLock<ProgramConfig>>,
    game_id: &str,
    save_id: &str,
    watcher: &mut FileWatcher,
) -> anyhow::Result<()> {
    let binding = program_config
        .read()
        .map_err(|_| anyhow::anyhow!("Unable to aquire read lock on program config"))?;
    let config = binding
        .games
        .values()
        .find(|g| g.id == game_id)
        .ok_or(anyhow::anyhow!("gameId does not exist"))?;

    let base_game_save_path = PathBuf::from_str(&config.save_folder_path)?;
    let save_file = config
        .save_files
        .iter()
        .find(|f| f.save_id == save_id)
        .ok_or(anyhow::anyhow!("Save file not found"))?;

    let save_to_restore_path = DIRS
        .data_dir()
        .join(&config.game_name)
        .join(&save_file.save_id);

    println!(
        "Restoring save: {save_id} for game: {game_id} from {0:#?} to {1:#?}",
        save_to_restore_path.as_os_str(),
        base_game_save_path.as_os_str()
    );

    watcher.stop_watching(&base_game_save_path)?;

    // remove all files and sub-directories in the base_game_save_path directory
    if base_game_save_path.exists() {
        for entry in std::fs::read_dir(&base_game_save_path)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                std::fs::remove_dir_all(&path)?;
            } else {
                std::fs::remove_file(&path)?;
            }
        }
    }

    // copy all files from within the save_to_restore_path directory into the base_game_save_path directory.
    fn copy_recursive(src: &Path, dest: &Path) -> anyhow::Result<()> {
        if src.is_dir() {
            if !dest.exists() {
                std::fs::create_dir_all(dest)?;
            }

            for entry in std::fs::read_dir(src)? {
                let entry = entry?;
                let path = entry.path();
                let new_dest = dest.join(
                    path.file_name()
                        .ok_or_else(|| anyhow::anyhow!("Unable to get file name"))?,
                );
                copy_recursive(&path, &new_dest)?;
            }
        } else {
            std::fs::copy(src, dest)?;
        }

        Ok(())
    }

    copy_recursive(&save_to_restore_path, &base_game_save_path)?;

    watcher.watch_new_game(&base_game_save_path)?;

    Ok(())
}

pub fn delete_backup_directory(
    program_config: &Arc<RwLock<ProgramConfig>>,
    game_id: &str,
) -> anyhow::Result<()> {
    let config = program_config
        .read()
        .map_err(|_| anyhow::anyhow!("Unable to aquire read lock on program config"))?;

    let game_config = config
        .games
        .values()
        .find(|g| g.id == game_id)
        .ok_or_else(|| {
            anyhow::anyhow!("Game config does not exist. This is an unexpected error")
        })?;

    let save_folder_path = DIRS.data_dir().join(&game_config.game_name);

    if save_folder_path.exists() {
        std::fs::remove_dir_all(save_folder_path)?;
    }

    Ok(())
}

pub fn delete_save(
    program_config: &Arc<RwLock<ProgramConfig>>,
    game_id: &str,
    save_id: &str,
) -> anyhow::Result<()> {
    let mut config = program_config
        .write()
        .map_err(|_| anyhow::anyhow!("Unable to aquire write lock on program config"))?;

    let (_, game) = config
        .games
        .iter_mut()
        .find(|(_, g)| (**g).id == game_id)
        .ok_or_else(|| {
            anyhow::anyhow!("Game config does not exist. This is an unexpected error")
        })?;

    let save_file_index = game
        .save_files
        .iter()
        .position(|f| f.save_id == save_id)
        .ok_or_else(|| anyhow::anyhow!("Save file not found"))?;

    let save_file = game.save_files.remove(save_file_index);

    let save_dir = DIRS
        .data_dir()
        .join(&game.game_name)
        .join(&save_file.save_id);

    if save_dir.exists() {
        std::fs::remove_dir_all(&save_dir)?;
    }

    config.save()?;
    crate::WINDOW
        .get()
        .ok_or_else(|| anyhow::anyhow!("Window not initialized"))?
        .emit("configUpdated", ())?;

    Ok(())
}
