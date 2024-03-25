import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ProgramConfig = {
  games: Record<string, GameConfig>;
};

export type GameConfig = {
  gameName: string;
  saveFiles: SaveFileMetadata[];
  saveFolderPath: string;
  maxSaveBackups: number;
};

export type SaveFileMetadata = {
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
      updateGames(state, action: PayloadAction<ProgramConfig>) {
        state.games = action.payload.games;
      },
    },
  });
}

export const configSlice = createConfigSlice();
export const { updateGames } = configSlice.actions;
export default configSlice.reducer;
