import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentStock, initializeStock } from '../lib/db';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.id === product.id);
      
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { ...product }]
        };
      }
    });
    return true;
  };

  const removeFromCart = (productId) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== productId)
    }));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }));
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 