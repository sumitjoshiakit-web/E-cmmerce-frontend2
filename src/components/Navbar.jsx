import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    toast.info('You have been logged out.');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight hover:opacity-85 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg shadow-sm">
              🛍️
            </span>
            <span>Shop</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`nav-link text-sm font-medium transition px-3 py-2 rounded-lg ${
                isActive('/') ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`nav-link text-sm font-medium transition px-3 py-2 rounded-lg ${
                isActive('/shop') ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Shop Catalog
            </Link>

            {/* Auth / user */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-medium truncate max-w-[120px]">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-rose-600 transition flex items-center gap-1 p-1.5 rounded-lg hover:bg-rose-50"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`text-sm font-medium transition px-3 py-2 rounded-lg ${
                  isActive('/login') ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Login
              </Link>
            )}

            {/* Cart Icon with badge */}
            <Link
              to="/checkout"
              className="relative p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition flex items-center focus-visible:ring-2 focus-visible:ring-gray-900"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right Bar: Cart & Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/checkout"
              className="relative p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Cart with ${totalItems} items`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gray-900 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl font-medium text-base min-h-[44px] flex items-center ${
              isActive('/') ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl font-medium text-base min-h-[44px] flex items-center ${
              isActive('/shop') ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Shop Catalog
          </Link>
          <Link
            to="/checkout"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl font-medium text-base min-h-[44px] flex items-center justify-between ${
              isActive('/checkout') ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>Your Cart</span>
            <span className="bg-gray-200 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </Link>

          <div className="pt-2 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-xl">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Signed in as <strong>{user.name}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition min-h-[44px] flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-gray-900 text-white font-medium px-4 py-3 rounded-xl hover:bg-gray-800 transition min-h-[44px]"
              >
                Login to Account
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
