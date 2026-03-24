import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { ItemsGetOut, Item, AdsState } from "../types";

const initialState: AdsState = {
  items: [],
  total: 0,
  currentItem: null,
  totalAll: 0,
  loading: false,
  error: null,
  updating: false,
};

export const adsSlice = createSlice({
  name: "ads",
  initialState,
  reducers: {
    setTotalAll: (state, action: PayloadAction<number>) => {
      state.totalAll = action.payload;
    },
    fetchAdsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAdsSuccess: (state, action: PayloadAction<ItemsGetOut>) => {
      state.loading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    fetchAdsFailure: (state) => {
      state.loading = false;
      state.error = "Ошибка загрузки";
    },
    fetchAdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAdSuccess: (state, action: PayloadAction<Item>) => {
      state.loading = false;
      state.currentItem = action.payload;
    },
    fetchAdFailure: (state) => {
      state.loading = false;
      state.error = "Ошибка загрузки";
    },
    updateAdStart: (state) => {
      state.updating = true;
      state.error = null;
    },
    updateAdSuccess: (state, action: PayloadAction<Item>) => {
      state.updating = false;
      state.currentItem = action.payload;
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = {
          id: action.payload.id,
          category: action.payload.category,
          title: action.payload.title,
          price: action.payload.price,
          needsRevision: action.payload.needsRevision,
        };
      }
    },
    updateAdFailure: (state) => {
      state.updating = false;
      state.error = "Ошибка сохранения";
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setTotalAll,
  fetchAdsStart,
  fetchAdsSuccess,
  fetchAdsFailure,
  fetchAdStart,
  fetchAdSuccess,
  fetchAdFailure,
  updateAdStart,
  updateAdSuccess,
  updateAdFailure,
  clearCurrentItem,
  clearError,
} = adsSlice.actions;

export default adsSlice.reducer;
