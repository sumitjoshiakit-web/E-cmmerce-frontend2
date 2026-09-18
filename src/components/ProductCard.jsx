import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.thumbnail);

  const handleQuickAdd = (event) => {
    event.stopPropagation();
    if (isAdding) return;

    setIsAdding(true);
    setTimeout(() => {
      addItem(product, 1);
      setIsAdding(false);
      setAddedRecently(true);
      toast.success(`Added "${product.title}" to your cart!`);
      setTimeout(() => setAddedRecently(false), 1800);
    }, 250);
  };

  const discount = product.discountPercentage
    ? Math.round(product.discountPercentage)
    : null;

  return (
    <article
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/product/${product.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.title}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.title}
          loading="lazy"
          decoding="async"
          onError={() => {
            // Graceful fallback for broken image links
            setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60');
          }}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              -{discount}%
            </span>
          )}
        </div>

        <span className="absolute top-3 right-3 text-[11px] font-medium bg-white/90 backdrop-blur-xs text-gray-700 px-2.5 py-1 rounded-full border border-gray-200/80 shadow-xs">
          {product.category}
        </span>
      </div>

      {/* Product Meta */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {Number(product.rating || 0).toFixed(1)}
          </span>
          <span>•</span>
          <span className="truncate">{product.brand || 'Authentic'}</span>
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-snug group-hover:text-gray-700 transition">
          {product.title}
        </h3>

        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none">
              ${Number(product.price).toFixed(2)}
            </div>
            {discount && (
              <span className="text-[11px] text-gray-400 line-through">
                ${(product.price / (1 - discount / 100)).toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 min-h-[38px] active:scale-95 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none ${
              addedRecently
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : addedRecently ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
