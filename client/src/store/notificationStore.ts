import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  show: boolean;
  type: "success" | "error";
}

const initialState: NotificationState = {
  show: false,
  type: "success",
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{ type: "success" | "error" }>,
    ) => {
      state.show = true;
      state.type = action.payload.type;
    },
    hideNotification: (state) => {
      state.show = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
