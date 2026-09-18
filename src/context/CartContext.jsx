// Migrated to Redux Toolkit (src/store/cartSlice.js)
// This hook provides a backward-compatible interface backed entirely by Redux dispatch & selectors.
import { useDispatch, useSelector } from 'react-redux';
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
} from '../store/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalItems = useSelector(selectTotalItems);
  const totalPrice = useSelector(selectTotalPrice);

  return {
    items,
    totalItems,
    totalPrice,
    addItem: (product, quantity = 1) => dispatch(addItem({ product, quantity })),
    removeItem: (id) => dispatch(removeItem(id)),
    updateQuantity: (id, quantity) => dispatch(updateQuantity({ id, quantity })),
    clearCart: () => dispatch(clearCart()),
  };
}

export function CartProvider({ children }) {
  // Redux Provider is mounted at the root level in src/index.jsx
  return <>{children}</>;
}

export default useCart;
