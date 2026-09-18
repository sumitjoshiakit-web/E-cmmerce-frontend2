import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { fetchAllProducts } from '../utils/api';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then((data) => {
        const sorted = [...(data || [])].sort((a, b) => b.rating - a.rating);
        setFeaturedProducts(sorted.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 text-white px-6 py-16 sm:px-12 sm:py-20 lg:px-16 shadow-lg">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-amber-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Redux Toolkit State & Client-Side AI Concierge</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Curated products, <br className="hidden sm:inline" />
            smarter shopping.
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
            Explore quality essentials powered by Redux-managed cart & filters, real-time AI buying advice, and instant checkout.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-900 px-6 py-3.5 font-bold text-sm hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-sm min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 font-semibold text-sm hover:bg-white/10 transition active:scale-95 min-h-[44px]"
            >
              <span>Instant Guest Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Features Value Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Free Shipping</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Complimentary on orders $50+</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white shrink-0">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">AI Concierge</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Live cart & deal suggestions</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Verified Quality</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Authentic catalog items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">30-Day Returns</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Risk-free guarantee</p>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Grid */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Top Rated Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5">
              Customer Favorites
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 inline-flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
