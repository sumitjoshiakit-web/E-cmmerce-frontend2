import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Loader2,
  ThumbsUp,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { fetchProductById } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { generateProductAdvice } from '../utils/ai';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedImg, setSelectedImg] = useState('');

  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setAiAdvice(null);
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
    setIsAdding(true);
    setTimeout(() => {
      addItem(product, quantity);
      setIsAdding(false);
      toast.success(`Added ${quantity} × "${product.title}" to your cart!`);
    }, 250);
  };

  const handleGenerateAiAdvice = async () => {
    if (!product || loadingAi) return;
    setLoadingAi(true);
    try {
      const advice = await generateProductAdvice(product);
      setAiAdvice(advice);
      toast.info('AI Buying Advice generated!');
    } catch (err) {
      console.error('AI Advice generation failed:', err);
      toast.error('Failed to generate AI advice.');
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse" />
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-20 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 my-8 shadow-xs">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Product Unavailable</h2>
        <p className="text-sm text-gray-500 mt-2">{error || 'The requested product could not be loaded.'}</p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="mt-6 inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition active:scale-95"
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
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main Product Layout */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs grid md:grid-cols-2">
        {/* Left: Product Images */}
        <div className="bg-gray-50 p-6 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
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
                  className={`w-14 h-14 rounded-xl border-2 p-1 bg-white overflow-hidden shrink-0 transition ${
                    selectedImg === img ? 'border-gray-900 shadow-xs' : 'border-gray-200 hover:border-gray-400'
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
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                SKU #{product.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{Number(product.rating || 0).toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews?.length || 12} customer reviews)
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-sm font-medium text-emerald-600">
                {product.stock > 0 ? `${product.stock} in stock` : 'Low Stock'}
              </span>
            </div>

            <div className="pt-2">
              <div className="text-3xl font-extrabold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </div>
              {product.discountPercentage && (
                <p className="text-xs text-rose-600 font-medium mt-0.5">
                  Save {Math.round(product.discountPercentage)}% off standard retail price
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quantity & CTA */}
          <div className="pt-6 border-t border-gray-200 mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-gray-600 hover:bg-gray-200 transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-sm px-4 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-gray-600 hover:bg-gray-200 transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                handleAddToCart();
                navigate('/checkout');
              }}
              className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 transition active:scale-95 min-h-[44px] shadow-sm text-center"
            >
              Buy Now / Checkout
            </button>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-500">
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

      {/* AI Buying Advice & Review Summary Section */}
      <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-3xl border border-indigo-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">AI Shopping Intelligence</h3>
              <p className="text-xs text-gray-600">
                Analyze reviews, stock reliability, and value proposition with client-side AI.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiAdvice}
            disabled={loadingAi}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            {loadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Product...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{aiAdvice ? 'Regenerate Analysis' : 'Generate AI Advice'}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Results Display */}
        {aiAdvice && (
          <div className="mt-6 pt-6 border-t border-indigo-100/80 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5 text-indigo-700" />
                Verdict: {aiAdvice.verdict}
              </span>
              <span className="text-xs font-semibold text-gray-600">
                Value Score: <strong className="text-indigo-600">{aiAdvice.valueScore}/100</strong>
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {aiAdvice.summary}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {/* Pros */}
              <div className="bg-white/80 rounded-2xl p-4 border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Key Highlights
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {aiAdvice.pros?.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="bg-white/80 rounded-2xl p-4 border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Things to Note
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {aiAdvice.cons?.map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
