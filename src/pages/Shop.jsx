import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Filter,
  Package,
} from 'lucide-react';
import { fetchAllProducts } from '../utils/api';
import { ProductCard } from '../components/ProductCard';
import { SidebarFilter } from '../components/SidebarFilter';
import { useToast } from '../context/ToastContext';
import {
  selectSearchQuery,
  selectCategory,
  selectPriceRange,
  selectMinRating,
  selectInStockOnly,
  selectSortBy,
  setSearchQuery,
  setSortBy,
  resetFilters,
} from '../store/filterSlice';

export function Shop() {
  const dispatch = useDispatch();
  const toast = useToast();

  // Redux Global Filter Selectors
  const searchQuery = useSelector(selectSearchQuery);
  const selectedCategory = useSelector(selectCategory);
  const priceRange = useSelector(selectPriceRange);
  const minRating = useSelector(selectMinRating);
  const inStockOnly = useSelector(selectInStockOnly);
  const sortBy = useSelector(selectSortBy);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const loadProducts = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Compute unique categories from loaded products
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [products]);

  // Memoized Filter & Sort Engine (Phase 3 Optimization: Re-render Mitigation)
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Search Query
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

    // 2. Category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 3. Price Range (Max Price Slider)
    if (priceRange?.max) {
      list = list.filter((p) => Number(p.price) <= priceRange.max);
    }

    // 4. Minimum Rating Filter
    if (minRating > 0) {
      list = list.filter((p) => Number(p.rating || 0) >= minRating);
    }

    // 5. In-Stock Only Toggle
    if (inStockOnly) {
      list = list.filter((p) => (p.stock || 0) > 0);
    }

    // 6. Sort By
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [products, searchQuery, selectedCategory, priceRange.max, minRating, inStockOnly, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'all') count++;
    if (priceRange.max < 2000) count++;
    if (minRating > 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [searchQuery, selectedCategory, priceRange.max, minRating, inStockOnly]);

  const handleSearchChange = useCallback((e) => {
    dispatch(setSearchQuery(e.target.value));
  }, [dispatch]);

  const handleClearSearch = useCallback(() => {
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  const handleSortChange = useCallback((e) => {
    dispatch(setSortBy(e.target.value));
  }, [dispatch]);

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    toast.info('All filters have been reset.');
  }, [dispatch, toast]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
            <div className="h-8 w-60 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-full sm:w-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          <div className="hidden lg:block h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse w-1/3" />
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 max-w-lg mx-auto my-8 shadow-xs">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          Couldn’t load products
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-md mx-auto">{error}</p>
        <button
          type="button"
          onClick={loadProducts}
          className="mt-6 inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Curated Storefront
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight">
            Explore All Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Redux-powered catalog with instant multifaceted filtering & live reactivity.
          </p>
        </div>

        {/* Search Input (dispatches to Redux) */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products, brands, tags..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle & Sort Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Mobile Filter Trigger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 shadow-xs min-h-[38px]"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white p-2"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results Counter & Sort Selector */}
        <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Showing <strong>{filteredProducts.length}</strong> of {products.length} items
          </span>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="price-asc">Sort: Price: Low to High</option>
              <option value="price-desc">Sort: Price: High to Low</option>
              <option value="title">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout: Sidebar (Desktop) + Grid */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Desktop Sticky Multifaceted Sidebar */}
        <aside className="hidden lg:block sticky top-24">
          <SidebarFilter
            categories={categories}
            totalCount={products.length}
          />
        </aside>

        {/* Mobile Drawer Slide-over */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
            />
            {/* Slide-over panel */}
            <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-gray-900 h-full p-4 overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-right duration-200">
              <SidebarFilter
                categories={categories}
                totalCount={products.length}
                isMobile={true}
                onClose={() => setMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Products Grid or Empty Match State */}
        <div className="min-w-0">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-center py-16 px-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No products match your criteria
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Try widening your price range slider or clearing the category filter.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
