import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModalSlice = {
  createGameModalOpen: boolean;
};

const initialState: ModalSlice = {
  createGameModalOpen: false,
};

export function createModalSlice() {
  return createSlice({
    name: "modals",
    initialState,
    reducers: {
      setGameModalOpen: (state, { payload }: PayloadAction<boolean>) => {
        state.createGameModalOpen = payload;
      },
    },
  });
}

export const configSlice = createModalSlice();
export const { setGameModalOpen } = configSlice.actions;
export default configSlice.reducer;
