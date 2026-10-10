import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Star,
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { fetchProductById } from '../utils/api';
import { addItem } from '../store/cartSlice';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImg, setSelectedImg] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProductById(id)
      .then((data) => {
        setProduct(data);
        setSelectedImg(data.thumbnail);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Product not found.');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product || isAdding) return;
    if (!isAuthenticated) {
      toast.info('Please sign in before adding items to your cart.');
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    setIsAdding(true);
    setTimeout(() => {
      // Redux action dispatch
      dispatch(addItem({ product, quantity }));
      setIsAdding(false);
      toast.success(`Added ${quantity} × "${product.title}" to your cart!`);
    }, 200);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 my-8 shadow-xs">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Unavailable</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error || 'The requested product could not be loaded.'}</p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="mt-6 inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/shop')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main Product Layout */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs grid md:grid-cols-2 transition-colors">
        {/* Left: Product Images */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
          <div className="w-full aspect-square max-h-[380px] flex items-center justify-center">
            <img
              src={selectedImg}
              alt={product.title}
              className="w-full h-full object-contain transition-all duration-300"
            />
          </div>

          {/* Thumbnail strip if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-6 overflow-x-auto max-w-full pb-1">
              {product.images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImg(img)}
                  className={`w-14 h-14 rounded-xl border-2 p-1 bg-white dark:bg-gray-800 overflow-hidden shrink-0 transition ${
                    selectedImg === img
                      ? 'border-gray-900 dark:border-white shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="p-6 md:p-10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                SKU #{product.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
              {product.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{Number(product.rating || 0).toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({product.reviews?.length || 12} reviews)
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {product.stock > 0 ? `${product.stock} in stock` : 'Low Stock'}
              </span>
            </div>

            <div className="pt-2">
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                ${Number(product.price).toFixed(2)}
              </div>
              {product.discountPercentage && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                  Save {Math.round(product.discountPercentage)}% off standard retail price
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quantity & CTA */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-sm px-4 min-w-[36px] text-center text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95 flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart (Redux)</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info('Please sign in before purchasing.');
                  navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
                  return;
                }
                if (!product || isAdding) return;
                dispatch(addItem({ product, quantity }));
                navigate('/checkout');
              }}
              className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 transition active:scale-95 min-h-[44px] shadow-sm text-center"
            >
              Buy Now / Checkout
            </button>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Free shipping on orders $50+</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                <span>30-Day Hassle-Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
