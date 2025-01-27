import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    total: 0
  });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.id === product.id);
      
      if (existingItem) {
        // 更新已存在的样品
        const updatedItems = prevCart.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...prevCart,
          items: updatedItems
        };
      } else {
        // 添加新样品
        return {
          ...prevCart,
          items: [...prevCart.items, { ...product, quantity: 1 }]
        };
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const item = prevCart.items.find(item => item.id === productId);
      if (item && item.quantity > 1) {
        // 如果数量大于1，减少数量
        return {
          ...prevCart,
          items: prevCart.items.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        };
      } else {
        // 如果数量为1，移除项目
        return {
          ...prevCart,
          items: prevCart.items.filter(item => item.id !== productId)
        };
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item =>
        item.id === productId
          ? { ...item, quantity: quantity }
          : item
      )
    }));
  };

  const clearCart = () => {
    setCart({
      items: [],
      total: 0
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 