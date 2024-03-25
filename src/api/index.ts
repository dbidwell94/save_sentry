import { invoke } from "@tauri-apps/api";

type ProgramConfig = {
  games: Record<string, GameConfig>;
};

type GameConfig = {
  name: string;
  saveFiles: SaveFileMetadata[];
  saveFolderPath: string;
  maxSaveBackups: number;
};

type SaveFileMetadata = {
  createdAt: string;
  updatedAt: string;
};

export async function getConfg(): Promise<ProgramConfig> {
  return await invoke("get_config");
}

export async function changeConfig(config: ProgramConfig): Promise<void> {
  return await invoke("change_config", config);
}
