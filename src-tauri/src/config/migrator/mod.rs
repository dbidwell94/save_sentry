//! This module performs the migration of the configuration file from the old format to the new format.

mod v1;
mod v2;

use crate::DIRS;
use serde::Deserialize;
use serde_json::Value;
pub use v2::{GameConfig, ProgramConfig, SaveFileMetadata, CONFIG_VERSION};

pub enum ConfigVersion {
    V1(v1::ProgramConfig),
    V2(v2::ProgramConfig),
}

impl<'de> Deserialize<'de> for ConfigVersion {
    fn deserialize<D>(deserializer: D) -> Result<ConfigVersion, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = serde_json::Value::deserialize(deserializer)?;
        let binding = Value::from(1);
        let config_version = value.get("configVersion").unwrap_or(&binding);

        match config_version
            .as_u64()
            .ok_or_else(|| serde::de::Error::custom("configVersion is not a number"))?
        {
            1 => Ok(ConfigVersion::V1(
                v1::ProgramConfig::deserialize(value).map_err(serde::de::Error::custom)?,
            )),
            2 => Ok(ConfigVersion::V2(
                v2::ProgramConfig::deserialize(value).map_err(serde::de::Error::custom)?,
            )),
            _ => Err(serde::de::Error::custom("Unknown config version")),
        }
    }
}

impl ConfigVersion {
    pub fn perform_migrations(mut self) -> anyhow::Result<ProgramConfig> {
        let latest_config_version;
        loop {
            match self {
                ConfigVersion::V1(v1_config) => {
                    let v2_config = v2::ProgramConfig::migrate_from(v1_config)?;
                    self = ConfigVersion::V2(v2_config);
                }
                ConfigVersion::V2(v2_config) => {
                    latest_config_version = v2_config;
                    // we are at the latest config. Break here.
                    break;
                }
            }
        }
        latest_config_version.save()?;
        Ok(latest_config_version)
    }

    pub fn load() -> anyhow::Result<Self> {
        let config_path = DIRS.config_dir().join("config.json");
        println!("Loading config at {:?}", config_path);
        let config: anyhow::Result<ConfigVersion> = match std::fs::read_to_string(config_path) {
            Ok(s) => Ok(serde_json::from_str::<ConfigVersion>(&s)?),
            Err(e) => {
                if e.kind() == std::io::ErrorKind::NotFound {
                    let default_config = ProgramConfig::default();
                    default_config.save()?;
                    let config = ConfigVersion::V2(default_config);
                    return Ok(config);
                }
                return Err(e.into());
            }
        };
        Ok(config?)
    }
}

pub trait Migrator<MigrateFrom> {
    type Migrated;
    fn migrate_from(old_config: MigrateFrom) -> anyhow::Result<Self::Migrated>;
}

impl ProgramConfig {
    pub fn save(&self) -> anyhow::Result<()> {
        let config_path = DIRS.config_dir().join("config.json");
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
