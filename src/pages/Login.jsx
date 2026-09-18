import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, LogIn, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Login() {
  const { loginAsGuest, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const finalName = customName.trim() || 'Guest Shopper';
      loginAsGuest(finalName);
      setIsSubmitting(false);
      toast.success(`Welcome back, ${finalName}!`);
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
        <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm text-2xl">
          🛍️
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center tracking-tight">
          Welcome to Shop
        </h2>
        <p className="text-sm text-gray-500 text-center mt-1">
          Sign in to enable protected checkout and personalized order tracking.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="login-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Your Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Alex Smith"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition font-semibold text-sm active:scale-98 shadow-sm min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{customName.trim() ? `Sign in as ${customName.trim()}` : 'Instant Guest Sign-In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Demo authentication • No password required</span>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
