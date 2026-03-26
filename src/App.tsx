import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

import Index from "./pages/Index";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CmsPage from "./pages/CmsPage";
import OrderTracking from "./pages/OrderTracking";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import ProductForm from "./pages/admin/ProductForm";
import OrderDetailPage from "./pages/admin/OrderDetailPage";
import AdminOrderTrackingPage from "./pages/admin/AdminOrderTrackingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/search" element={<Search />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<OrderTracking />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/products/new" element={<ProtectedAdminRoute><ProductForm /></ProtectedAdminRoute>} />
              <Route path="/admin/products/edit/:productId" element={<ProtectedAdminRoute><ProductForm /></ProtectedAdminRoute>} />
              <Route path="/admin/orders/:orderId" element={<ProtectedAdminRoute><OrderDetailPage /></ProtectedAdminRoute>} />
              <Route path="/admin/orders/:orderId/tracking" element={<ProtectedAdminRoute><AdminOrderTrackingPage /></ProtectedAdminRoute>} />

              <Route path="/about" element={<CmsPage pageType="aboutUs" title="About Us" />} />
              <Route path="/privacy" element={<CmsPage pageType="privacyPolicy" title="Privacy Policy" />} />
              <Route path="/terms" element={<CmsPage pageType="termsAndConditions" title="Terms & Conditions" />} />
              <Route path="/returns" element={<CmsPage pageType="returnsPolicy" title="Returns Policy" />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
