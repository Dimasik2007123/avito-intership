import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { DraftState, Item } from "../types";

const loadDrafts = (): DraftState => {
  const drafts: DraftState = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("draft_")) {
      const id = key.replace("draft_", "");
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          drafts[id] = JSON.parse(saved) as Partial<Item>;
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  return drafts;
};

const initialState: DraftState = loadDrafts();

const DraftsSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    saveDraft: (
      state,
      action: PayloadAction<{ id: string; data: Partial<Item> }>,
    ) => {
      const { id, data } = action.payload;
      state[id] = { ...state[id], ...data };
      localStorage.setItem(`draft_${id}`, JSON.stringify(state[id]));
    },
    clearDraft: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state[id];
      localStorage.removeItem(`draft_${id}`);
    },
    clearAllDrafts: () => {
      return {};
    },
  },
});

export const { saveDraft, clearDraft, clearAllDrafts } = DraftsSlice.actions;
export default DraftsSlice.reducer;
