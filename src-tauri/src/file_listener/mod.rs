use debounce::EventDebouncer;
use std::{
    path::{Path, PathBuf},
    sync::{Arc, RwLock},
};

use notify::Watcher;

use crate::{config::ProgramConfig, file_handler::backup_directory};

pub struct FileWatcher {
    watcher: notify::RecommendedWatcher,
}

impl FileWatcher {
    pub fn new(config: Arc<RwLock<ProgramConfig>>) -> anyhow::Result<Self> {
        struct DebounceArgs {
            root_dir: PathBuf,
            game_name: String,
            max_save_backups: u32,
            program_config: Arc<RwLock<ProgramConfig>>,
        }
        impl PartialEq for DebounceArgs {
            fn eq(&self, other: &Self) -> bool {
                self.root_dir == other.root_dir && self.game_name == other.game_name
            }
        }
        let debouncer = EventDebouncer::new(
            std::time::Duration::from_millis(1500),
            |debounce_args: DebounceArgs| {
                backup_directory(
                    &debounce_args.root_dir,
                    &debounce_args.game_name,
                    debounce_args.max_save_backups,
                    debounce_args.program_config,
                )
                .expect("Failed to backup directory")
            },
        );

        let cloned_config = config.clone();

        let mut watcher =
            notify::recommended_watcher(move |result: Result<notify::Event, notify::Error>| {
                use notify::EventKind;
                let evt = result.unwrap();
                let second_cloned_config = cloned_config.clone();

                let config = cloned_config.read().unwrap();

                match evt.kind {
                    EventKind::Any | EventKind::Access(_) | EventKind::Other => {
                        println!("File event occurred, but no change happened")
                    }
                    _ => {
                        // check if any of the paths in the event match the config file
                        for game in config.games.values() {
                            if evt
                                .paths
                                .iter()
                                .any(|p| p.starts_with(PathBuf::from(&game.save_folder_path)))
                            {
                                debouncer.put(DebounceArgs {
                                    root_dir: PathBuf::from(&game.save_folder_path),
                                    game_name: game.game_name.clone(),
                                    max_save_backups: game.max_save_backups,
                                    program_config: second_cloned_config.clone(),
                                });
                            }
                        }
                    }
                }
            })?;

        let config = config.read().map_err(|e| anyhow::anyhow!(e.to_string()))?;

        for game in config.games.values() {
            if !game.watcher_enabled {
                continue;
            }
            watcher.watch(
                Path::new(&game.save_folder_path),
                notify::RecursiveMode::Recursive,
            )?;
        }

        Ok(Self { watcher })
    }

    pub fn watch_new_game(&mut self, save_folder_path: &Path) -> anyhow::Result<()> {
        self.watcher
            .watch(save_folder_path, notify::RecursiveMode::Recursive)?;

        Ok(())
    }

    pub fn stop_watching(&mut self, save_folder_path: &Path) -> anyhow::Result<()> {
        self.watcher
            .unwatch(save_folder_path)
            .map_err(|e| anyhow::anyhow!(e.to_string()))?;

        Ok(())
    }
}
