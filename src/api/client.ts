import axios from 'axios';
import { products } from '@/data/products';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api` : '/api');
const baseURL = API_BASE_URL.startsWith('http') ? API_BASE_URL : (API_BASE_URL.startsWith('/') ? API_BASE_URL : `/${API_BASE_URL}`);

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for 401 Unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('⚠️ Session expired or unauthorized. Redirecting to login...');
            // In a real app, you'd trigger a logout in AuthContext, 
            // but a page reload is a safe way to force the ProtectedRoute to catch the missing session.
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

console.log('🚀 API Client Initialized with Base URL:', API_BASE_URL);

// Mock data for demo/offline use
const MOCK_ADMIN_USER = {
    _id: 'mock-admin-id',
    name: 'Dev Admin',
    email: 'admin@vruksha.com',
    role: 'admin'
};

export const fetchProducts = async (category?: string, search?: string, sale?: string) => {
    try {
        const response = await api.get('/products');
        let filteredProducts = response.data;

        if (category) {
            filteredProducts = filteredProducts.filter((p: any) => 
                (p.category || '').toLowerCase() === category.toLowerCase() ||
                (p.subCategory || '').toLowerCase() === category.toLowerCase()
            );
        }

        if (search) {
            const query = search.toLowerCase();
            filteredProducts = filteredProducts.filter((p: any) =>
                (p.name || p.product_name || '').toLowerCase().includes(query) ||
                (p.description || '').toLowerCase().includes(query)
            );
        }

        if (sale) {
            if (sale === 'flash') {
                filteredProducts = filteredProducts.filter((p: any) => (p.discountPercentage || 0) >= 30);
            }
        }

        return filteredProducts;
    } catch (error) {
        console.error("Failed to fetch products from API", error);
        return [];
    }
};

export const fetchProductById = async (id: string) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error("Product not found on server", error);
        // Temporary fallback to mock data only if API fails and we have it
        const product = products.find(p => p.id === id);
        return product || null;
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
    const response = await api.get('/settings');
    return response.data;
};

export const updateSettingsAPI = async (settings: any) => {
    const response = await api.patch('/settings', settings);
    return response.data;
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

// Auth interceptors removed to enforce real authentication
// (Previously contained a mock fallback for /auth/me)

export default api;
