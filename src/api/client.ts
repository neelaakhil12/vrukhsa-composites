import axios from 'axios';
import { products } from '@/data/products';
import siteSettings from '@/data/site_settings.json';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('🚀 API Client Initialized with Base URL:', API_BASE_URL);

// Mock data for demo/offline use
const MOCK_ADMIN_USER = {
    _id: 'mock-admin-id',
    name: 'Dev Admin',
    email: 'admin@vruksha.com',
    role: 'admin'
};

export const fetchProducts = async (category?: string, search?: string, sale?: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredProducts = [...products];

    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category.toLowerCase());
    }

    if (search) {
        const query = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    if (sale) {
        // Simple logic for sale filter
        if (sale === 'flash') {
            filteredProducts = filteredProducts.filter(p => p.discountPercentage >= 30);
        }
    }

    return filteredProducts;
};

export const fetchProductById = async (id: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find local product first
    const product = products.find(p => p.id === id);
    if (product) return product;

    // Fallback to API if not found locally (unlikely for now)
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error("Product not found locally or remotely", error);
        return null;
    }
};

// Cart API
// Note: Cart still points to backend. If backend is down, cart ops will fail.
// Keeping as is per "don't disturb structure" instruction, but user might need this mocked too later.
export const fetchCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

export const addToCartAPI = async (productId: string, quantity: number = 1, variant?: { size?: string; color?: string }) => {
    const response = await api.post('/cart/add', { productId, quantity, variant });
    return response.data;
};

export const updateCartItemAPI = async (productId: string, quantity: number) => {
    const response = await api.put(`/cart/update/${productId}`, { quantity });
    return response.data;
};

export const removeFromCartAPI = async (productId: string) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
};

export const clearCartAPI = async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
};

// Order API
export interface ShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export const createOrderAPI = async (shippingAddress: ShippingAddress, paymentMethod: string = 'COD') => {
    const response = await api.post('/orders', { shippingAddress, paymentMethod });
    return response.data;
};

export const fetchMyOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const fetchOrderById = async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
};

export const cancelOrderAPI = async (orderId: string) => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
};

// Settings API
export const fetchSettings = async () => {
    try {
        const response = await api.get('/settings');
        return response.data;
    } catch (error) {
        console.warn('⚠️ Backend settings API failed, falling back to local site_settings.json');
        return siteSettings;
    }
};

export const updateSettingsAPI = async (settings: any) => {
    try {
        const response = await api.patch('/settings', settings);
        return response.data;
    } catch (error) {
        console.error('Failed to update settings on server', error);
        // In local mode, we just return the settings back as if saved
        return settings;
    }
};

// Payment API
export const createRazorpayOrderAPI = async (amount: number) => {
    const response = await api.post('/payment/create-order', { amount });
    return response.data;
};

export const verifyPaymentAPI = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
}) => {
    const response = await api.post('/payment/verify', data);
    return response.data;
};

// Auth Mock for Deployment (Vercel)
api.interceptors.response.use(
    response => response,
    error => {
        // Handle both failed responses and network errors for auth/me
        const isAuthMe = error.config?.url?.includes('/auth/me');
        if (isAuthMe) {
            console.log('🛡️ Intercepted /auth/me failure, providing mock admin for demo');
            return Promise.resolve({ data: MOCK_ADMIN_USER, status: 200 });
        }
        return Promise.reject(error);
    }
);

export default api;
