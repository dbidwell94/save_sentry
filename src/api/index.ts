import { ProgramConfig } from "@src/store/configReducer";
import { invoke } from "@tauri-apps/api";

export async function getConfg(): Promise<ProgramConfig> {
  return await invoke("get_config");
}

export async function changeConfig(config: ProgramConfig): Promise<void> {
  return await invoke("change_config", config);
}
