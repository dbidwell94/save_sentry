use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ProgramConfig {
    pub games: HashMap<String, GameConfig>,
}

impl ProgramConfig {
    pub fn load() -> anyhow::Result<Self> {
        let project_dir = directories::ProjectDirs::from("", "Biddydev", "SaveScum")
            .ok_or_else(|| anyhow::anyhow!("Could not find config directory"))?;

        let config_path = project_dir.config_dir().join("config.json");
        println!("Loading config at {:?}", config_path);
        let config: anyhow::Result<ProgramConfig> = match std::fs::read_to_string(config_path) {
            Ok(s) => Ok(serde_json::from_str::<ProgramConfig>(&s)?),
            Err(e) => {
                if e.kind() == std::io::ErrorKind::NotFound {
                    let config = ProgramConfig {
                        games: HashMap::new(),
                    };
                    config.save()?;
                    return Ok(config);
                }
                return Err(e.into());
            }
        };
        Ok(config?)
    }

    pub fn save(&self) -> anyhow::Result<()> {
        let project_dir = directories::ProjectDirs::from("", "Biddydev", "SaveScum")
            .ok_or_else(|| anyhow::anyhow!("Could not find config directory"))?;
        let config_path = project_dir.config_dir().join("config.json");
        let config_str = serde_json::to_string_pretty(&self)?;

        // check if directory exists. If not, create it recursively
        if !config_path
            .parent()
            .ok_or_else(|| anyhow::anyhow!("Directory does not exist"))?
            .exists()
        {
            std::fs::create_dir_all(
                config_path
                    .parent()
                    .ok_or_else(|| anyhow::anyhow!("Directory does not exist"))?,
            )?;
        }

        std::fs::write(config_path, config_str)?;
        Ok(())
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GameConfig {
    pub game_name: String,
    pub save_folder_path: String,
    pub max_save_backups: u32,
    pub save_files: Vec<SaveFileMetadata>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SaveFileMetadata {
    pub created_at: String,
    pub updated_at: String,
}
