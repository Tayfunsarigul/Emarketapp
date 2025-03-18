import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global state , veri paylaşma
const CartContext = createContext();

// Sepet ürün sayısını tutar 
export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  //Sepet doluysa CartItems eklenir ,asyncstorage cihazdaki sepeti alır, reduce toplam adeti hesaplar
  const updateCartItemCount = async () => {
    try {
      const cartItems = await AsyncStorage.getItem('cartItems');
      if (cartItems) {
        const items = JSON.parse(cartItems);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  };
  //Uygulama açıldığında sepet sayısı güncellenir
  useEffect(() => {
    updateCartItemCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartItemCount, updateCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

//context verilerine ulaşma
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 