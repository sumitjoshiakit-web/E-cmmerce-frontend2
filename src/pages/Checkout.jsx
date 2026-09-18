import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Loader2,
  CreditCard,
  Building,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { generateCartSummary } from '../utils/ai';

export function Checkout() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '123 Market Street, Apt 4B',
    city: 'San Francisco',
    postalCode: '94103',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');

  // AI Cart Summary State
  const [aiSummary, setAiSummary] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto-generate or allow manual generation of AI cart summary
  useEffect(() => {
    if (items.length > 0) {
      handleGenerateAiSummary();
    }
  }, [items.length]);

  const handleGenerateAiSummary = async () => {
    if (items.length === 0) return;
    setIsAiLoading(true);
    try {
      const summary = await generateCartSummary(items, totalPrice, user);
      setAiSummary(summary);
    } catch (err) {
      console.warn('AI Cart Summary failed:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateQty = (id, newQty, title) => {
    updateQuantity(id, newQty);
    if (newQty > 0) {
      toast.info(`Updated "${title}" quantity to ${newQty}.`);
    } else {
      toast.warning(`Removed "${title}" from your cart.`);
    }
  };

  const handleRemoveItem = (id, title) => {
    removeItem(id);
    toast.warning(`Removed "${title}" from your cart.`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Your cart has been cleared.');
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (items.length === 0 || isProcessingOrder) return;

    setIsProcessingOrder(true);

    setTimeout(() => {
      const generatedOrderNo = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(generatedOrderNo);
      setIsProcessingOrder(false);
      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed successfully! Receipt sent.');
    }, 900);
  };

  // 1. Order Placed Success View
  if (orderPlaced) {
    return (
      <section className="max-w-2xl mx-auto py-12 px-4 sm:px-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full uppercase tracking-wider">
          Confirmed
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-gray-600 text-sm max-w-md mx-auto">
          We’ve received your order and dispatched confirmation to{' '}
          <strong>{user?.name ? `${user.name.toLowerCase()}@example.com` : 'your email'}</strong>.
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8 text-left shadow-xs space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
            <span>Order Reference:</span>
            <strong className="text-gray-900 font-mono text-sm">{orderNumber}</strong>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Shipping To:</span>
            <span className="text-gray-900 font-medium">
              {shippingAddress.fullName || 'Valued Shopper'}, {shippingAddress.city}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Payment Method:</span>
            <span className="text-gray-900 font-medium capitalize">{paymentMethod} (Demo Mode)</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-100 text-sm font-bold text-gray-900">
            <span>Status:</span>
            <span className="text-emerald-600">Dispatched for Packing 📦</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-95 shadow-sm min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-7 py-3 rounded-xl font-semibold hover:bg-gray-50 transition active:scale-95 min-h-[44px]"
          >
            Return to Home
          </Link>
        </div>
      </section>
    );
  }

  // 2. Empty Cart View
  if (items.length === 0) {
    return (
      <section className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-3xl border border-gray-200 shadow-xs my-8">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Looks like you haven’t added any items to your shopping cart yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white px-7 py-3 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-95 shadow-sm min-h-[44px]"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Store Catalog
        </Link>
      </section>
    );
  }

  // 3. Main Active Checkout Layout
  return (
    <section className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Checkout & Review
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review your {totalItems} item{totalItems === 1 ? '' : 's'} before placing your order.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCart}
          className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium transition p-1 hover:bg-rose-50 rounded-lg self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear entire cart
        </button>
      </div>

      {/* Grid: Cart Items (Left) vs. AI Summary & Order Checkout (Right) */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 shadow-xs hover:border-gray-300 transition"
            >
              {/* Product Thumbnail */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 flex items-center justify-center p-2 shrink-0 self-center sm:self-start">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Category: {item.category || 'Lifestyle'}
                  </p>
                </div>

                {/* Price and Quantity Controls */}
                <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1, item.title)}
                      className="p-2 text-gray-600 hover:bg-gray-200 transition min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-semibold text-xs px-3 min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1, item.title)}
                      className="p-2 text-gray-600 hover:bg-gray-200 transition min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400 block sm:inline mr-2">
                      ${Number(item.price).toFixed(2)} each
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* AI Cart Summary & Savings Advisor Card */}
          <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/70 rounded-2xl border border-purple-100 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">AI Cart Summary & Advisor</h4>
                  <p className="text-[11px] text-gray-500">Live order value optimization</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={isAiLoading}
                className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs hover:bg-purple-50 transition"
              >
                {isAiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Refresh Insights</span>
              </button>
            </div>

            {isAiLoading ? (
              <div className="py-4 flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Analyzing cart bundle & potential savings...</span>
              </div>
            ) : aiSummary ? (
              <div className="space-y-3 text-xs text-gray-700">
                <p className="leading-relaxed font-medium">{aiSummary.overview}</p>
                <div className="bg-white/80 rounded-xl p-3 border border-purple-100">
                  <span className="font-bold text-purple-900 block mb-1">Savings Advisor:</span>
                  <p className="text-gray-600">{aiSummary.savingTips}</p>
                </div>
                {aiSummary.dealScore > 0 && (
                  <div className="flex items-center justify-between text-gray-600 pt-1">
                    <span>Bundle Value Score:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {aiSummary.dealScore}/100 High Value
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Checkout Form & Summary */}
        <aside className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs lg:sticky lg:top-24 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Order Summary</h2>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Items Total ({totalItems})</span>
              <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard Shipping</span>
              <span className="font-medium text-emerald-600">
                {totalPrice >= 50 ? 'FREE' : '$4.99'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="font-medium text-gray-900">$0.00</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900">Grand Total</span>
            <span className="text-2xl font-extrabold text-gray-900">
              ${(totalPrice >= 50 ? totalPrice : totalPrice + 4.99).toFixed(2)}
            </span>
          </div>

          {/* Shipping Details Form */}
          <form onSubmit={handlePlaceOrder} className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Delivery Details
            </h3>

            <div>
              <label htmlFor="customer-name" className="block text-xs font-medium text-gray-700 mb-1">
                Recipient Name
              </label>
              <input
                id="customer-name"
                type="text"
                required
                value={shippingAddress.fullName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                }
                placeholder="Jane Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition"
              />
            </div>

            <div>
              <label htmlFor="street-address" className="block text-xs font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                id="street-address"
                type="text"
                required
                value={shippingAddress.address}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, address: e.target.value })
                }
                placeholder="123 Market St"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city-input" className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input
                  id="city-input"
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition"
                />
              </div>
              <div>
                <label htmlFor="zip-input" className="block text-xs font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  id="zip-input"
                  type="text"
                  required
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Payment Option
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                    paymentMethod === 'card'
                      ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card (Demo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('delivery')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                    paymentMethod === 'delivery'
                      ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Pay on Delivery</span>
                </button>
              </div>
            </div>

            {/* Submit Button with Loading State */}
            <button
              type="submit"
              disabled={isProcessingOrder}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 min-h-[48px] focus-visible:ring-2 focus-visible:ring-gray-900 mt-4"
            >
              {isProcessingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Demo Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Place Order • ${(totalPrice >= 50 ? totalPrice : totalPrice + 4.99).toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center pt-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Simulated demo order • No actual funds will be charged</span>
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}
