import { createSlice } from '@reduxjs/toolkit';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const initialItems = loadFromStorage('cart_items', []);

function calculateTotals(items) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    totalItems,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
}

const initialTotals = calculateTotals(initialItems);

const initialState = {
  items: initialItems,
  totalItems: initialTotals.totalItems,
  totalPrice: initialTotals.totalPrice,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      if (!product || !product.id) return;

      const existingIndex = state.items.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail || product.images?.[0] || '',
          category: product.category || 'General',
          stock: product.stock ?? 99,
          quantity,
        });
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      saveToStorage('cart_items', state.items);
    },

    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      saveToStorage('cart_items', state.items);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const target = state.items.find((item) => item.id === id);

      if (target) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.id !== id);
        } else {
          target.quantity = quantity;
        }
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      saveToStorage('cart_items', state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      saveToStorage('cart_items', []);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectTotalItems = (state) => state.cart.totalItems;
export const selectTotalPrice = (state) => state.cart.totalPrice;
export const selectCartItemById = (state, id) => state.cart.items.find((i) => i.id === id);

export default cartSlice.reducer;
