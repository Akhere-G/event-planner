import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  theme: string;
  darkMode: boolean;
}

const initialState: ThemeState = {
  theme: localStorage.getItem("app-theme") || "",
  darkMode: localStorage.getItem("theme") === "dark",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      localStorage.setItem("app-theme", action.payload);
      updateDOM(state.theme, state.darkMode);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("theme", state.darkMode ? "dark" : "light");
      updateDOM(state.theme, state.darkMode);
    },
    syncDOM: (state) => {
      updateDOM(state.theme, state.darkMode);
    },
  },
});

const updateDOM = (theme: string, darkMode: boolean) => {
  const root = document.documentElement;

  if (darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  root.classList.forEach((className) => {
    if (className.startsWith("theme-")) {
      root.classList.remove(className);
    }
  });

  if (theme) {
    root.classList.add(theme);
  }
};

export const { setTheme, toggleDarkMode, syncDOM } = themeSlice.actions;
export default themeSlice.reducer;
