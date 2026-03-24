import { createSlice } from "@reduxjs/toolkit";
import type { FiltersState } from "../types";

type Layout = "grid" | "list";

const loadLayout = (): Layout => {
  const saved = localStorage.getItem("layout");
  return saved === "list" ? "list" : "grid";
};

const initialState: FiltersState = {
  search: "",
  categories: [],
  needsRevisionOnly: false,
  sortColumn: "createdAt",
  sortDirection: "desc",
  layout: loadLayout(),
  page: 1,
};
export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
    },
    toggleCategory: (state, action) => {
      const idx: number = state.categories.indexOf(action.payload);
      if (idx === -1) {
        state.categories.push(action.payload);
      } else {
        state.categories.splice(idx, 1);
      }
      state.page = 1;
    },
    setNeedsRevision: (state, action) => {
      state.needsRevisionOnly = action.payload;
      state.page = 1;
    },
    setSort: (state, action) => {
      state.sortColumn = action.payload.column;
      state.sortDirection = action.payload.direction;
      state.page = 1;
    },
    setLayout: (state, action: { payload: Layout }) => {
      state.layout = action.payload;
      localStorage.setItem("layout", action.payload);
    },
    toggleLayout: (state) => {
      state.layout = state.layout === "grid" ? "list" : "grid";
      localStorage.setItem("layout", state.layout);
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    reset: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  setSearch,
  toggleCategory,
  setNeedsRevision,
  setSort,
  setPage,
  reset,
  setLayout,
  toggleLayout,
} = filtersSlice.actions;

export default filtersSlice.reducer;
