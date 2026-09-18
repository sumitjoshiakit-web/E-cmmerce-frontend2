import { createSlice } from '@reduxjs/toolkit';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const getInitialTheme = () => {
  const saved = loadFromStorage('app_theme', null);
  if (saved === 'dark' || saved === 'light') return saved;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const initialTheme = getInitialTheme();

// Apply class on load
if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme,
  },
  reducers: {
    toggleTheme: (state) => {
      const next = state.mode === 'light' ? 'dark' : 'light';
      state.mode = next;
      saveToStorage('app_theme', next);
      if (typeof document !== 'undefined') {
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action) => {
      const next = action.payload === 'dark' ? 'dark' : 'light';
      state.mode = next;
      saveToStorage('app_theme', next);
      if (typeof document !== 'undefined') {
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectThemeMode = (state) => state.theme.mode;

export default themeSlice.reducer;
