use std::path::Path;

use notify::Watcher;

pub struct FileWatcher {
    watcher: notify::RecommendedWatcher,
}

impl FileWatcher {
    pub fn new(config: crate::config::ProgramConfig) -> anyhow::Result<Self> {
        let mut watcher =
            notify::recommended_watcher(move |result: Result<notify::Event, notify::Error>| {
                let evt = result.unwrap();

                match evt.kind {
                    notify::EventKind::Any => todo!(),
                    notify::EventKind::Access(_) => todo!(),
                    notify::EventKind::Create(e) => println!("Create: {e:?}"),
                    notify::EventKind::Modify(e) => println!("Modify: {e:?}"),
                    notify::EventKind::Remove(e) => println!("Remove: {e:?}"),
                    notify::EventKind::Other => todo!(),
                }
            })?;

        for game in config.games.values() {
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
}
