use super::Migrator;
use crate::{
    file_handler::{calculate_directory_checksum_recursive, Hash, Hasher},
    DIRS,
};
use serde::{ser::SerializeStruct, Deserialize, Serialize};
use sha2::Digest;
use std::collections::HashMap;
use ts_rs::TS;

pub const CONFIG_VERSION: u32 = 2;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, TS)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct ProgramConfig {
    pub games: HashMap<String, GameConfig>,
    pub config_version: u32,
}

impl Default for ProgramConfig {
    fn default() -> Self {
        Self {
            games: HashMap::new(),
            config_version: CONFIG_VERSION,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, TS)]
#[serde(rename_all = "camelCase")]
pub struct GameConfig {
    pub id: String,
    pub game_name: String,
    pub save_folder_path: String,
    pub max_save_backups: u32,
    pub save_files: Vec<SaveFileMetadata>,
    pub watcher_enabled: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, TS)]
#[ts(rename_all = "camelCase")]
pub struct SaveFileMetadata {
    pub created_at: String,
    pub save_id: String,
    #[ts(as = "String")]
    pub hash: Hash,
}

impl Serialize for SaveFileMetadata {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use base64::prelude::*;
        let mut state = serializer.serialize_struct("SaveFileMetadata", 3)?;
        state.serialize_field("createdAt", &self.created_at)?;
        state.serialize_field("saveId", &self.save_id)?;
        state.serialize_field("hash", &BASE64_STANDARD.encode(self.hash))?;

        state.end()
    }
}

struct SaveFileMetadataVisitor;

impl<'de> serde::de::Visitor<'de> for SaveFileMetadataVisitor {
    type Value = SaveFileMetadata;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct SaveFileMetadata")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        use base64::prelude::*;
        let mut created_at = None;
        let mut save_id = None;
        let mut hash: Option<String> = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "createdAt" => {
                    if created_at.is_some() {
                        return Err(serde::de::Error::duplicate_field("createdAt"));
                    }
                    created_at = Some(map.next_value()?);
                }
                "saveId" => {
                    if save_id.is_some() {
                        return Err(serde::de::Error::duplicate_field("saveId"));
                    }
                    save_id = Some(map.next_value()?);
                }
                "hash" => {
                    if hash.is_some() {
                        return Err(serde::de::Error::duplicate_field("hash"));
                    }
                    hash = Some(map.next_value()?);
                }
                _ => {
                    return Err(serde::de::Error::unknown_field(
                        key.as_str(),
                        &["createdAt", "saveId", "hash"],
                    ));
                }
            }
        }

        let created_at = created_at.ok_or_else(|| serde::de::Error::missing_field("createdAt"))?;
        let save_id = save_id.ok_or_else(|| serde::de::Error::missing_field("saveId"))?;
        let hash = hash
            .map(|val| BASE64_STANDARD.decode(val))
            .ok_or_else(|| serde::de::Error::missing_field("hash"))?
            .map_err(serde::de::Error::custom)?;

        Ok(SaveFileMetadata {
            created_at,
            save_id,
            hash: Hash::clone_from_slice(hash.as_slice()),
        })
    }
}

impl<'de> Deserialize<'de> for SaveFileMetadata {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_struct(
            "SaveFileMetadata",
            &["createdAt", "saveId", "hash"],
            SaveFileMetadataVisitor,
        )
    }
}

impl Migrator<super::v1::ProgramConfig> for ProgramConfig {
    type Migrated = Self;

    fn migrate_from(old_config: super::v1::ProgramConfig) -> anyhow::Result<Self::Migrated> {
        let migrated_games: HashMap<_, _> = old_config
            .games
            .into_iter()
            .map(|(k, v)| {
                (
                    k,
                    GameConfig {
                        game_name: v.game_name.clone(),
                        save_folder_path: v.save_folder_path,
                        max_save_backups: v.max_save_backups,
                        id: uuid::Uuid::new_v4().to_string(),
                        save_files: v
                            .save_files
                            .iter()
                            .map(|metadata| {
                                // calculate hash of the save file directory
                                let save_file_path =
                                    DIRS.data_dir().join(&v.game_name).join(&metadata.save_id);

                                let mut hasher = Hasher::default();
                                _ = calculate_directory_checksum_recursive(
                                    &save_file_path,
                                    &mut hasher,
                                );

                                SaveFileMetadata {
                                    created_at: metadata.created_at.clone(),
                                    save_id: metadata.save_id.clone(),
                                    hash: hasher.finalize(),
                                }
                            })
                            .collect(),
                        watcher_enabled: true,
                    },
                )
            })
            .collect();
        Ok(Self {
            games: migrated_games,
            config_version: CONFIG_VERSION,
        })
    }
}
