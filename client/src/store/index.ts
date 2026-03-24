import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "./filtersStore";
import adsReducer from "./adsStore";
import draftsReducer from "./draftsStore";
import notificationReducer from "./notificationStore";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    ads: adsReducer,
    drafts: draftsReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
