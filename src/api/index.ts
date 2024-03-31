import { ProgramConfig } from "@src/store/configReducer";
import { invoke } from "@tauri-apps/api";

export async function getConfg(): Promise<ProgramConfig> {
  return await invoke("get_config");
}

export async function changeConfig(config: ProgramConfig): Promise<void> {
  return await invoke("change_config", config);
}

export async function addNewGame(gameName: string, saveFolderPath: string, maxSaveBackups: number): Promise<void> {
  return await invoke("add_game", {
    gameName,
    saveFolderPath,
    maxSaveBackups,
  });
}

export async function openFolderPicker() {
  return await invoke("open_folder_browser");
}
