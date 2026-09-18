import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import {
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  updateQuantity,
  removeItem,
  clearCart,
} from '../store/cartSlice';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { generateCartSummary } from '../utils/ai';

export function Checkout() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalItems = useSelector(selectTotalItems);
  const totalPrice = useSelector(selectTotalPrice);

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

  const handleGenerateAiSummary = useCallback(async () => {
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
  }, [items, totalPrice, user]);

  useEffect(() => {
    if (items.length > 0) {
      handleGenerateAiSummary();
    }
  }, [items.length, handleGenerateAiSummary]);

  const handleUpdateQty = (id, newQty, title) => {
    dispatch(updateQuantity({ id, quantity: newQty }));
    if (newQty > 0) {
      toast.info(`Updated "${title}" quantity to ${newQty}.`);
    } else {
      toast.warning(`Removed "${title}" from your cart.`);
    }
  };

  const handleRemoveItem = (id, title) => {
    dispatch(removeItem(id));
    toast.warning(`Removed "${title}" from your cart.`);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
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
      dispatch(clearCart());
      toast.success('Order placed successfully! Receipt sent.');
    }, 900);
  };

  // 1. Order Placed Success View
  if (orderPlaced) {
    return (
      <section className="max-w-2xl mx-auto py-12 px-4 sm:px-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-3.5 py-1 rounded-full uppercase tracking-wider">
          Confirmed
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
          We’ve received your order and dispatched confirmation to{' '}
          <strong>{user?.name ? `${user.name.toLowerCase()}@example.com` : 'your email'}</strong>.
        </p>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mt-8 text-left shadow-xs space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <span>Order Reference:</span>
            <strong className="text-gray-900 dark:text-white font-mono text-sm">{orderNumber}</strong>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Shipping To:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {shippingAddress.fullName || 'Valued Shopper'}, {shippingAddress.city}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Payment Method:</span>
            <span className="text-gray-900 dark:text-white font-medium capitalize">
              {paymentMethod} (Demo Mode)
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white">
            <span>Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400">Dispatched for Packing 📦</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95 shadow-sm min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-7 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 min-h-[44px]"
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
      <section className="max-w-md mx-auto text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs my-8 transition-colors">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Your cart is empty
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          Looks like you haven’t added any items to your shopping cart yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95 shadow-sm min-h-[44px]"
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Checkout & Review
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review your {totalItems} item{totalItems === 1 ? '' : 's'} before placing your order.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCart}
          className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg self-start sm:self-auto min-h-[36px]"
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
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition"
            >
              {/* Product Thumbnail */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2 shrink-0 self-center sm:self-start">
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
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    Category: {item.category || 'Lifestyle'}
                  </p>
                </div>

                {/* Price and Quantity Controls */}
                <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1, item.title)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-semibold text-xs px-3 min-w-[32px] text-center text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1, item.title)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400 dark:text-gray-500 block sm:inline mr-2">
                      ${Number(item.price).toFixed(2)} each
                    </span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* AI Cart Summary & Savings Advisor Card */}
          <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/70 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/50 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    AI Cart Summary & Advisor
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Live order value optimization</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={isAiLoading}
                className="text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 font-semibold flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 shadow-2xs hover:bg-purple-50 dark:hover:bg-gray-700 transition"
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
              <div className="py-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Analyzing cart bundle & potential savings...</span>
              </div>
            ) : aiSummary ? (
              <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed font-medium">{aiSummary.overview}</p>
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 border border-purple-100 dark:border-purple-900/50">
                  <span className="font-bold text-purple-900 dark:text-purple-300 block mb-1">
                    Savings Advisor:
                  </span>
                  <p className="text-gray-600 dark:text-gray-300">{aiSummary.savingTips}</p>
                </div>
                {aiSummary.dealScore > 0 && (
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 pt-1">
                    <span>Bundle Value Score:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {aiSummary.dealScore}/100 High Value
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Checkout Form & Summary */}
        <aside className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs lg:sticky lg:top-24 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Order Summary
          </h2>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Items Total ({totalItems})</span>
              <span className="font-medium text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard Shipping</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {totalPrice >= 50 ? 'FREE' : '$4.99'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900 dark:text-white">Grand Total</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              ${(totalPrice >= 50 ? totalPrice : totalPrice + 4.99).toFixed(2)}
            </span>
          </div>

          {/* Shipping Details Form */}
          <form onSubmit={handlePlaceOrder} className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Delivery Details
            </h3>

            <div>
              <label
                htmlFor="customer-name"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
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
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition"
              />
            </div>

            <div>
              <label
                htmlFor="street-address"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
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
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="city-input"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  City
                </label>
                <input
                  id="city-input"
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition"
                />
              </div>
              <div>
                <label
                  htmlFor="zip-input"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Zip Code
                </label>
                <input
                  id="zip-input"
                  type="text"
                  required
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition"
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
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-60 text-white dark:text-gray-900 py-3.5 rounded-xl font-semibold transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 min-h-[48px] focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-100 mt-4"
            >
              {isProcessingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Demo Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Place Order • ${(totalPrice >= 50 ? totalPrice : totalPrice + 4.99).toFixed(2)}
                  </span>
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
