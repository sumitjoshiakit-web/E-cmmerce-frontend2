import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { selectTotalItems } from '../store/cartSlice';
import { selectThemeMode, toggleTheme } from '../store/themeSlice';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Navbar() {
  const dispatch = useDispatch();
  const totalItems = useSelector(selectTotalItems);
  const themeMode = useSelector(selectThemeMode);
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

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    toast.info(`Switched to ${themeMode === 'light' ? 'Dark' : 'Light'} theme.`);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white tracking-tight hover:opacity-85 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="w-9 h-9 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-lg shadow-sm">
              🛍️
            </span>
            <span>Shop</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/"
              className={`text-sm font-medium transition px-3 py-2 rounded-lg ${
                isActive('/')
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`text-sm font-medium transition px-3 py-2 rounded-lg ${
                isActive('/shop')
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Shop Catalog
            </Link>

            {/* Redux Theme Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition active:scale-95 flex items-center justify-center min-w-[40px] min-h-[40px]"
              title={`Toggle ${themeMode === 'light' ? 'Dark' : 'Light'} Mode (Redux Global)`}
              aria-label="Toggle color theme"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Auth / user */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium truncate max-w-[120px]">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
                  isActive('/login')
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Login
              </Link>
            )}

            {/* Cart Icon with badge */}
            <Link
              to="/checkout"
              className="relative p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-100"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 dark:bg-emerald-500 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right Bar: Theme, Cart & Hamburger */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <Link
              to="/checkout"
              className="relative p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Cart with ${totalItems} items`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gray-900 dark:bg-emerald-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl font-medium text-base min-h-[44px] flex items-center ${
              isActive('/')
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl font-medium text-base min-h-[44px] flex items-center ${
              isActive('/shop')
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Shop Catalog
          </Link>
          <Link
            to="/checkout"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl font-medium text-base min-h-[44px] flex items-center justify-between ${
              isActive('/checkout')
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span>Your Cart</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </Link>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>
                    Signed in as <strong>{user.name}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition min-h-[44px] flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium px-4 py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition min-h-[44px]"
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
