import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadFromStorage('cart_items', []));

  useEffect(() => saveToStorage('cart_items', items), [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeItem = useCallback((id) => setItems(prev => prev.filter(i => i.id !== id)), []);
  const updateQuantity = useCallback((id, newQty) => {
    if (newQty <= 0) { setItems(prev => prev.filter(i => i.id !== id)); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  }, []);
  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const value = { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
