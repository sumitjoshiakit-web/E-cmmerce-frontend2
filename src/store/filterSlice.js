import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  category: 'all',
  priceRange: {
    min: 0,
    max: 2000,
  },
  minRating: 0,
  inStockOnly: false,
  sortBy: 'featured', // 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'title'
};

export const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setPriceRange: (state, action) => {
      state.priceRange = {
        ...state.priceRange,
        ...action.payload,
      };
    },
    setMinRating: (state, action) => {
      state.minRating = action.payload;
    },
    setInStockOnly: (state, action) => {
      state.inStockOnly = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.category = 'all';
      state.priceRange = { min: 0, max: 2000 };
      state.minRating = 0;
      state.inStockOnly = false;
      state.sortBy = 'featured';
    },
  },
});

export const {
  setSearchQuery,
  setCategory,
  setPriceRange,
  setMinRating,
  setInStockOnly,
  setSortBy,
  resetFilters,
} = filterSlice.actions;

// Selectors
export const selectFilters = (state) => state.filters;
export const selectSearchQuery = (state) => state.filters.searchQuery;
export const selectCategory = (state) => state.filters.category;
export const selectPriceRange = (state) => state.filters.priceRange;
export const selectMinRating = (state) => state.filters.minRating;
export const selectInStockOnly = (state) => state.filters.inStockOnly;
export const selectSortBy = (state) => state.filters.sortBy;

export default filterSlice.reducer;
