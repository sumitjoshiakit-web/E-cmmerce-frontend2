import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { AIAssistant } from './components/AIAssistant';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { selectThemeMode } from './store/themeSlice';
import { Loader2 } from 'lucide-react';

// Code-split pages for performance optimization
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then((m) => ({ default: m.Shop })));
const ProductDetail = lazy(() =>
  import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail }))
);
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })));

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin text-gray-900 dark:text-white" />
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Loading experience...</p>
    </div>
  );
}

function Layout({ children }) {
  const themeMode = useSelector(selectThemeMode);

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 page-container py-6 sm:py-8 w-full">{children}</main>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8 mt-12 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Shop E-Commerce • Global Redux Store State Architecture</p>
          <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
            <span>Free Shipping $50+</span>
            <span>•</span>
            <span>30-Day Returns</span>
            <span>•</span>
            <span>Redux Toolkit Powered</span>
          </div>
        </div>
      </footer>
      <AIAssistant />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Layout>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
