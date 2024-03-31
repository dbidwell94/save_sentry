import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProgramConfig } from "@src/tauriTypes/ProgramConfig";

type ConfigState = Omit<ProgramConfig, "configVersion">;

const initialState: ConfigState = {
  games: {},
};

export function createConfigSlice() {
  return createSlice({
    name: "config",
    initialState,
    reducers: {
      updateGames(state, action: PayloadAction<ConfigState>) {
        state.games = action.payload.games;
      },
    },
  });
}

export const configSlice = createConfigSlice();
export const { updateGames } = configSlice.actions;
export default configSlice.reducer;
