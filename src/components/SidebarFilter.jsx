import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SlidersHorizontal,
  RotateCcw,
  Star,
  Check,
  PackageCheck,
  X,
  Sparkles,
} from 'lucide-react';
import {
  selectCategory,
  selectPriceRange,
  selectMinRating,
  selectInStockOnly,
  setCategory,
  setPriceRange,
  setMinRating,
  setInStockOnly,
  resetFilters,
} from '../store/filterSlice';
import { useToast } from '../context/ToastContext';

export function SidebarFilter({ categories = [], totalCount = 0, isMobile = false, onClose = () => {} }) {
  const dispatch = useDispatch();
  const toast = useToast();

  const activeCategory = useSelector(selectCategory);
  const priceRange = useSelector(selectPriceRange);
  const minRating = useSelector(selectMinRating);
  const inStockOnly = useSelector(selectInStockOnly);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'all') count++;
    if (priceRange.max < 2000) count++;
    if (minRating > 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [activeCategory, priceRange.max, minRating, inStockOnly]);

  const handleCategoryChange = useCallback((cat) => {
    dispatch(setCategory(cat));
  }, [dispatch]);

  const handleMaxPriceChange = useCallback((e) => {
    const val = Number(e.target.value);
    dispatch(setPriceRange({ min: 0, max: val }));
  }, [dispatch]);

  const handleRatingChange = useCallback((rating) => {
    dispatch(setMinRating(rating));
  }, [dispatch]);

  const handleInStockToggle = useCallback((e) => {
    dispatch(setInStockOnly(e.target.checked));
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(resetFilters());
    toast.info('All filters have been reset.');
  }, [dispatch, toast]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-6 shadow-xs transition-colors">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-900 dark:text-white" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1 font-medium"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="price-slider" className="font-semibold text-gray-900 dark:text-white">
            Max Price
          </label>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60">
            ${priceRange.max}
          </span>
        </div>

        <input
          id="price-slider"
          type="range"
          min="10"
          max="2000"
          step="10"
          value={priceRange.max}
          onChange={handleMaxPriceChange}
          className="w-full accent-gray-900 dark:accent-indigo-500 cursor-pointer h-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
        />

        <div className="flex justify-between text-[11px] text-gray-400">
          <span>$10</span>
          <span>$1,000</span>
          <span>$2,000</span>
        </div>
      </div>

      {/* 2. Category Selector */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-900 dark:text-white block mb-1">
          Categories
        </span>

        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
              activeCategory === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span>All Categories</span>
            {activeCategory === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium capitalize flex items-center justify-between transition ${
                activeCategory === cat
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="truncate">{cat}</span>
              {activeCategory === cat && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Rating Filter */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-900 dark:text-white block mb-1">
          Minimum Rating
        </span>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { val: 0, label: 'All Ratings' },
            { val: 4.5, label: '4.5 ★ & up' },
            { val: 4.0, label: '4.0 ★ & up' },
            { val: 3.0, label: '3.0 ★ & up' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => handleRatingChange(item.val)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-center transition ${
                minRating === item.val
                  ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. In-Stock Only Toggle */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              In-Stock Only
            </span>
          </div>

          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={handleInStockToggle}
            className="w-4 h-4 rounded text-gray-900 dark:text-indigo-500 focus:ring-gray-900 border-gray-300 rounded-sm cursor-pointer"
          />
        </label>
      </div>

      {/* Status footer in sidebar */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Redux State Sync: Active</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
      </div>
    </div>
  );
}
