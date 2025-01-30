import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [stockLevels, setStockLevels] = useState({});

  // 从本地存储加载数据
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedStockLevels = localStorage.getItem('stockLevels');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedStockLevels) setStockLevels(JSON.parse(savedStockLevels));
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('stockLevels', JSON.stringify(stockLevels));
  }, [cart, stockLevels]);

  const addToCart = (product) => {
    const quantity = product.quantity || 1;
    const currentStock = stockLevels[product.id] ?? product.stock;
    
    if (quantity > currentStock) {
      alert('库存不足');
      return false;
    }

    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.id === product.id);
      if (existingItem) {
        return {
          ...prevCart,
          items: prevCart.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      return {
        ...prevCart,
        items: [...prevCart.items, { ...product, quantity }]
      };
    });

    // 更新库存
    setStockLevels(prev => ({
      ...prev,
      [product.id]: currentStock - quantity
    }));

    return true;
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const removedItem = prevCart.items.find(item => item.id === productId);
      if (removedItem) {
        // 恢复库存
        setStockLevels(prev => ({
          ...prev,
          [productId]: (prev[productId] ?? removedItem.stock) + removedItem.quantity
        }));
      }
      return {
        ...prevCart,
        items: prevCart.items.filter(item => item.id !== productId)
      };
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart(prevCart => {
      const item = prevCart.items.find(item => item.id === productId);
      if (!item) return prevCart;

      const currentStock = stockLevels[productId] ?? item.stock;
      const quantityDiff = newQuantity - item.quantity;

      if (currentStock < quantityDiff) {
        alert('库存不足');
        return prevCart;
      }

      // 更新库存
      setStockLevels(prev => ({
        ...prev,
        [productId]: currentStock - quantityDiff
      }));

      return {
        ...prevCart,
        items: prevCart.items.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      };
    });
  };

  const clearCart = () => {
    // 恢复所有库存
    cart.items.forEach(item => {
      setStockLevels(prev => ({
        ...prev,
        [item.id]: (prev[item.id] ?? item.stock) + item.quantity
      }));
    });
    setCart({ items: [] });
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      stockLevels,
      setStockLevels
    }}>
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