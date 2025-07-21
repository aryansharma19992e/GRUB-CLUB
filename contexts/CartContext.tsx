'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';

// Cart type: { [itemId: string]: number }
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (itemId) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[itemId]) {
        updated[itemId] -= 1;
        if (updated[itemId] <= 0) delete updated[itemId];
      }
      return updated;
    });
  };

  const clearCart = () => setCart({});

  // getTotalPrice will be implemented in the consumer with menu data

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
} 