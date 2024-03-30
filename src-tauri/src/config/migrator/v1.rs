use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ProgramConfig {
    pub games: HashMap<String, GameConfig>,
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
    pub save_id: String,
}
