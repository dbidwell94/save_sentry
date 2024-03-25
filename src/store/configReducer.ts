import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

const initialState: ProgramConfig = {
  games: {},
};

export function createConfigSlice() {
  return createSlice({
    name: "config",
    initialState,
    reducers: {
      updateConfig(state, action: PayloadAction<ProgramConfig>) {
        state = action.payload;
      },
    },
  });
}

export const configSlice = createConfigSlice();
export const { updateConfig } = configSlice.actions;
export default configSlice.reducer;
