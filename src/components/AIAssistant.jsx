import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ShoppingBag,
  Gift,
  Tag,
  Key,
  Bot,
  User,
  Plus,
} from 'lucide-react';
import {
  selectCartItems,
  selectTotalPrice,
  addItem,
} from '../store/cartSlice';
import { useToast } from '../context/ToastContext';
import { fetchAllProducts } from '../utils/api';
import {
  chatWithShoppingAssistant,
  generateCartSummary,
  getGeminiApiKey,
  setGeminiApiKey,
} from '../utils/ai';

export function AIAssistant({ currentProduct = null }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "👋 Hello! I'm your AI Shopping Concierge. I can summarize your cart, scout the best deals, or recommend gifts based on what's in our store!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load catalog for grounding recommendations
  useEffect(() => {
    fetchAllProducts()
      .then((data) => setCatalog(data || []))
      .catch((err) => console.warn('Catalog load in AI Assistant:', err));

    const key = getGeminiApiKey();
    setHasApiKey(Boolean(key));
    setCustomKeyInput(key);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    const userMsgId = Date.now().toString();
    const userMsg = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (textToSend.toLowerCase().includes('summarize my cart')) {
        const summary = await generateCartSummary(cartItems, totalPrice);
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `${summary.overview}\n\n**Deal Score**: ${summary.dealScore}/100 🎯\n**Tip**: ${summary.savingTips}\n\n**Recommendations:**\n${summary.suggestions.map((s) => `• ${s}`).join('\n')}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        toast.info('AI Cart Summary generated!');
      } else {
        const response = await chatWithShoppingAssistant({
          message: textToSend,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          cartItems,
          totalPrice,
          currentProduct,
          catalogProducts: catalog,
        });

        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          products: response.recommendedProducts || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I ran into a momentary glitch while generating that insight, but I'm still available to help guide your shopping! Ask me about any product or category.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setGeminiApiKey(customKeyInput);
    const key = getGeminiApiKey();
    setHasApiKey(Boolean(key));
    setShowSettings(false);
    toast.success(key ? 'Gemini API Key saved successfully!' : 'Default local intelligence engine activated.');
  };

  const handleQuickAdd = (product) => {
    dispatch(addItem({ product, quantity: 1 }));
    toast.success(`Added ${product.title} to your cart!`);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Trigger Floating Button */}
      {!isOpen && (
        <button
          type="button"
          id="ai-assistant-launcher-btn"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-gray-900"
          aria-label="Open AI Shopping Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <Sparkles className="w-5 h-5 text-amber-300 dark:text-amber-500 transition-transform group-hover:rotate-12" />
          <span className="font-semibold text-sm">Ask AI Concierge</span>
          {cartItems.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 dark:bg-gray-900/20 text-white dark:text-gray-900 rounded-full font-medium">
              {cartItems.length}
            </span>
          )}
        </button>
      )}

      {/* Chat Drawer / Modal Container */}
      {isOpen && (
        <div
          id="ai-shopping-assistant-panel"
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="bg-gray-900 dark:bg-gray-800 text-white p-4 flex items-center justify-between border-b dark:border-gray-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm leading-none">ShopAI Concierge</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-full font-medium">
                    {hasApiKey ? 'Gemini Live' : 'Smart Assist'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Context-aware shopping intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                title="API Settings"
                aria-label="API Settings"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1.5 truncate">
              <ShoppingBag className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="truncate">
                Cart: <strong>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</strong> (${totalPrice.toFixed(2)})
              </span>
            </div>
            {currentProduct && (
              <span className="bg-gray-200/80 dark:bg-gray-700 px-2 py-0.5 rounded text-[11px] text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                Viewing: {currentProduct.title}
              </span>
            )}
          </div>

          {/* Optional API Key Drawer */}
          {showSettings && (
            <form onSubmit={handleSaveApiKey} className="bg-gray-100 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 text-xs">
              <label htmlFor="gemini-key-input" className="font-semibold text-gray-700 dark:text-gray-200 block mb-1">
                Gemini API Key (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="gemini-key-input"
                  type="password"
                  placeholder="Enter Gemini API Key or leave empty for smart fallback"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                <button
                  type="submit"
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Save
                </button>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                If no key is configured, the local heuristic engine delivers instant offline responses!
              </p>
            </form>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm bg-white dark:bg-gray-900">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-gray-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200/70 dark:border-gray-700'
                  }`}
                >
                  <p className="whitespace-pre-line text-[13px]">{m.content}</p>

                  {/* Inline Product Recommendations */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Suggested Items:
                      </p>
                      {m.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2.5 rounded-xl shadow-xs hover:border-gray-300 transition"
                        >
                          <img
                            src={prod.thumbnail}
                            alt={prod.title}
                            className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                              {prod.title}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                              ${Number(prod.price).toFixed(2)}{' '}
                              <span className="text-amber-600 dark:text-amber-400 font-normal">★ {prod.rating}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(prod)}
                            className="p-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 rounded-lg transition shrink-0"
                            title="Add to Cart"
                            aria-label={`Add ${prod.title} to cart`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-gray-800 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-amber-300" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-700 dark:text-gray-300" />
                  <span>ShopAI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleSendMessage('⚡ Summarize my cart and savings')}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-full font-medium transition"
            >
              <ShoppingBag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Summarize Cart
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('🎯 What are the best value deals right now?')}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-full font-medium transition"
            >
              <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Best Deals
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('🎁 Give me top gift ideas under $50')}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-full font-medium transition"
            >
              <Gift className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              Gift Ideas
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about products, deals, cart..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 text-white dark:text-gray-900 p-2.5 rounded-xl font-medium transition shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-gray-900"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
