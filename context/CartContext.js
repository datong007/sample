import { createContext, useContext, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });

  const getTotalQuantity = () => {
    return cart.items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      return sum + quantity;
    }, 0);
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = parseInt(existingItem.quantity) + parseInt(product.quantity);
        
        return {
          ...prevCart,
          items: prevCart.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        };
      }
      
      return {
        ...prevCart,
        items: [...prevCart.items, product]
      };
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
      clearCart,
      getTotalQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 