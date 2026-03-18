import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchCart, addToCartAPI, updateCartItemAPI, removeFromCartAPI, clearCartAPI } from '@/api/client';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to transform backend cart to frontend format
const transformCartItems = (backendCart: any): CartItem[] => {
  if (!backendCart?.items) return [];

  return backendCart.items.map((item: any) => {
    const product = item.productId;
    if (!product) return null;

    return {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.images?.[0] || product.image,
      quantity: item.quantity,
      variant: item.variant,
    };
  }).filter(Boolean);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch cart on login
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const cart = await fetchCart();
          setItems(transformCartItems(cart));
        } catch (error) {
          console.error('Failed to load cart:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear cart when logged out
        setItems([]);
      }
    };

    loadCart();
  }, [user]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'>) => {
    if (!user) {
      // Guest user - local only (Phase 3B will handle this)
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      toast.info('Login to save your cart!');
      return;
    }

    try {
      const updatedCart = await addToCartAPI(item.id, 1, item.variant);
      setItems(transformCartItems(updatedCart));
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item');
    }
  }, [user]);

  const removeFromCart = useCallback(async (id: string) => {
    if (!user) {
      setItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    try {
      const updatedCart = await removeFromCartAPI(id);
      setItems(transformCartItems(updatedCart));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast.error('Failed to remove item');
    }
  }, [user]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return;

    if (!user) {
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
      return;
    }

    try {
      const updatedCart = await updateCartItemAPI(id, quantity);
      setItems(transformCartItems(updatedCart));
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      await clearCartAPI();
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const discount = items.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const total = subtotal - discount;

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      discount,
      total,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
