import { ProgramConfig } from "@tauri/ProgramConfig";
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

export async function restoreSaveFile(gameId: string, saveFileId: string) {
  return await invoke("restore_save", { gameId, saveId: saveFileId });
}

export async function deleteSaveFile(gameId: string, saveFileId: string) {
  return await invoke("delete_save", { gameId, saveId: saveFileId });
}
