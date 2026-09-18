import React, { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Sparkles, Filter, X } from 'lucide-react';
import { fetchAllProducts } from '../utils/api';
import { ProductCard } from '../components/ProductCard';
import { useToast } from '../context/ToastContext';

export function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const toast = useToast();

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load products.');
      toast.error('Could not reach the catalog API. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
    toast.info('Filters have been reset.');
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-8 w-60 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-full shrink-0 animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded-md animate-pulse w-1/3" />
                <div className="h-5 bg-gray-100 rounded-md animate-pulse" />
                <div className="h-3 bg-gray-100 rounded-md animate-pulse w-3/4" />
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-lg mx-auto my-8 shadow-xs">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Couldn’t load products</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">{error}</p>
        <button
          type="button"
          onClick={loadProducts}
          className="mt-6 inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Curated Storefront
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">
            Explore All Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover verified items across multiple lifestyle categories.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or brands..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize shrink-0 transition-all active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="text-gray-500">
            Showing <strong>{filteredProducts.length}</strong> of {products.length}
          </span>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="price-asc">Sort: Price: Low to High</option>
              <option value="price-desc">Sort: Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-16 px-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No products match your criteria</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the selected category filter.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
