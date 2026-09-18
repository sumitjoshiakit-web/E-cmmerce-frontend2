/**
 * Client-Side AI Engine & Gemini API Wrapper
 * 
 * NOTE: For production deployments, API keys should ideally be proxied through a backend service.
 * In accordance with client-side frontend requirements, this module utilizes the client-side
 * Gemini API with an automatic intelligent fallback engine to ensure seamless zero-crash operation.
 */

// Model selection conforming to Gemini API guidelines
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Retrieves the active Gemini API Key from environment or local storage
 * Uses GEMINI_API_KEY
 */
export function getGeminiApiKey() {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  }
  // Check process.env.GEMINI_API_KEY (populated by server/Vite define)
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return '';
}

/**
 * Stores or clears a user-provided Gemini API key
 */
export function setGeminiApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('custom_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
  }
}

/**
 * Core Gemini API caller with fallback to intelligent local reasoning.
 * First tries the secure server-side /api/ai proxy with GEMINI_API_KEY,
 * then direct client-side call if a key is available,
 * and finally defaults to the built-in heuristic reasoning engine.
 */
async function callGemini(prompt, systemInstruction = '') {
  // 1. Try server-side /api/ai endpoint first (safest for GEMINI_API_KEY)
  try {
    const serverRes = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) return candidateText;
    }
  } catch {
    // /api/ai not available or fetch failed, fallback to direct key
  }

  // 2. Direct client call if GEMINI_API_KEY or custom key exists
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return null; // Signals fallback to local heuristics engine
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn('Gemini API call returned status', response.status);
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.warn('Gemini API error, switching to smart local intelligence:', err);
    return null;
  }
}

/**
 * 1. AI Cart Summary & Savings Advisor
 * Reads the live cart state, total price, and user profile to generate actionable insights
 */
export async function generateCartSummary(cartItems = [], totalPrice = 0, user = null) {
  if (!cartItems.length) {
    return {
      overview: 'Your shopping cart is currently empty.',
      suggestions: ['Browse our trending products to discover great deals!'],
      savingTips: 'Orders over $50 unlock free express shipping perks.',
      dealScore: 0,
      categoryMix: {},
    };
  }

  const itemsDescription = cartItems
    .map(
      (item) =>
        `- ${item.title} (Qty: ${item.quantity}, Price: $${Number(item.price).toFixed(
          2
        )}, Category: ${item.category || 'General'})`
    )
    .join('\n');

  const prompt = `Analyze this customer's shopping cart and provide a concise JSON object with:
- "overview": a 2-sentence summary of the cart mix and value.
- "savingTips": a specific actionable tip for discounts or bundle savings.
- "dealScore": an integer from 70 to 99 evaluating the cart's value-for-money.
- "suggestions": an array of 2-3 short suggestions for complementary products or checkout tips.

Customer Name: ${user?.name || 'Shopper'}
Total Price: $${totalPrice.toFixed(2)}
Cart Items:
${itemsDescription}

Respond strictly in valid JSON format only, without markdown fences if possible.`;

  const geminiResponse = await callGemini(
    prompt,
    'You are an expert e-commerce shopping advisor that outputs strictly valid JSON.'
  );

  if (geminiResponse) {
    try {
      const cleanJson = geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch {
      // Parse fallback if formatting was imperfect
    }
  }

  // Intelligent Local Heuristic Engine (zero-network reliable fallback)
  const categoryCounts = {};
  cartItems.forEach((i) => {
    const cat = i.category || 'general';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + i.quantity;
  });

  const categories = Object.keys(categoryCounts);
  const totalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  let dealScore = 85;
  if (totalPrice > 100) dealScore = 94;
  else if (totalPrice > 50) dealScore = 90;

  const savingTips =
    totalPrice >= 75
      ? '🎉 Qualifying for Free Express Delivery and VIP order handling!'
      : `💡 Add $${(75 - totalPrice).toFixed(2)} more to unlock priority packaging and bundle bonuses!`;

  return {
    overview: `You have ${totalCount} item${
      totalCount > 1 ? 's' : ''
    } across ${categories.join(', ')}. Your curated selection represents balanced value.`,
    savingTips,
    dealScore,
    suggestions: [
      'Items in your cart qualify for 30-day risk-free returns.',
      categories.includes('beauty') || categories.includes('fragrances')
        ? 'Consider pairing personal care items with a travel organizer.'
        : 'Review product dimensions and warranty details before final purchase.',
      'Check out with guest login or registered user for automatic receipt tracking.',
    ],
    categoryMix: categoryCounts,
  };
}

/**
 * 2. AI Product Review & Buying Advice Generator
 * Analyzes product specifications, rating, reviews, and stock
 */
export async function generateProductAdvice(product) {
  if (!product) return null;

  const prompt = `Provide a concise buying decision guide for this product:
Product: ${product.title}
Brand: ${product.brand || 'Unbranded'}
Price: $${product.price}
Rating: ${product.rating} / 5
Category: ${product.category}
Description: ${product.description}
Stock: ${product.stock}
Reviews count: ${product.reviews?.length || 0}

Output strictly valid JSON with these keys:
- "verdict": "Highly Recommended" | "Great Value" | "Solid Buy"
- "summary": 2 sentences summarizing who this product is best suited for.
- "pros": array of 3 specific positive highlights.
- "cons": array of 2 potential caveats or things to check before buying.
- "valueScore": number from 80 to 98`;

  const geminiResponse = await callGemini(
    prompt,
    'You are a consumer tech and shopping advisor who evaluates products honestly and returns valid JSON.'
  );

  if (geminiResponse) {
    try {
      const cleanJson = geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      // Fall through to local intelligence
    }
  }

  // Intelligent Local Heuristics
  const rating = Number(product.rating) || 4.2;
  const isHighRated = rating >= 4.5;
  const verdict = isHighRated
    ? 'Highly Recommended'
    : product.price < 50
    ? 'Great Value'
    : 'Solid Buy';

  const pros = [
    `Strong customer satisfaction rating of ★ ${rating.toFixed(1)} / 5`,
    product.stock > 10 ? 'Healthy warehouse inventory ready for prompt dispatch' : 'Exclusive limited stock',
    `Versatile design in the ${product.category || 'lifestyle'} collection`,
  ];

  const cons = [
    'Colors and packaging may slightly vary depending on batch production',
    product.price > 100
      ? 'Higher initial investment compared to generic market alternatives'
      : 'Popular item subject to frequent demand surges',
  ];

  return {
    verdict,
    summary: `${product.title} offers an impressive blend of practical utility and aesthetic polish. Ideal for buyers seeking dependable quality in ${product.category || 'modern goods'}.`,
    pros,
    cons,
    valueScore: Math.min(98, Math.max(82, Math.round(rating * 19.5))),
  };
}

/**
 * 3. Interactive Shopping Chatbot Agent
 * Handles conversational queries with awareness of the current store state
 */
export async function chatWithShoppingAssistant({
  message,
  conversationHistory = [],
  cartItems = [],
  totalPrice = 0,
  currentProduct = null,
  catalogProducts = [],
}) {
  const currentCartDesc = cartItems.length
    ? cartItems.map((i) => `${i.title} ($${i.price} x${i.quantity})`).join(', ')
    : 'Empty';

  const viewingDesc = currentProduct
    ? `Currently viewing: ${currentProduct.title} ($${currentProduct.price}, Category: ${currentProduct.category})`
    : 'Browsing main catalog';

  const sampleCatalog = catalogProducts.slice(0, 15).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category,
    rating: p.rating,
  }));

  const systemPrompt = `You are "ShopAI", the friendly, knowledgeable shopping assistant for the Shop e-commerce store.
Current User Context:
- Cart: ${currentCartDesc} (Total: $${totalPrice.toFixed(2)})
- Viewing: ${viewingDesc}
- Store Catalog Sample: ${JSON.stringify(sampleCatalog)}

Instructions:
1. Help the user find products, compare options, evaluate cart value, or choose gifts.
2. Be polite, concise, and helpful (keep answers under 3 short paragraphs).
3. If you recommend any product from the catalog, mention its title and price clearly.
4. If asked about shipping, orders over $50 qualify for free shipping.`;

  const prompt = `Conversation history:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}

User: ${message}
ShopAI:`;

  const geminiResponse = await callGemini(prompt, systemPrompt);

  if (geminiResponse && geminiResponse.trim()) {
    // Identify recommended product ids from response
    const recommendedIds = [];
    catalogProducts.forEach((p) => {
      if (
        geminiResponse.toLowerCase().includes(p.title.toLowerCase()) ||
        geminiResponse.toLowerCase().includes(`product #${p.id}`)
      ) {
        if (!recommendedIds.includes(p.id)) recommendedIds.push(p.id);
      }
    });

    return {
      text: geminiResponse.trim(),
      recommendedProducts: catalogProducts.filter((p) => recommendedIds.includes(p.id)).slice(0, 3),
      isAiGenerated: true,
    };
  }

  // Intelligent Contextual Heuristic Chat Engine
  const lower = message.toLowerCase();
  let reply = '';
  let matchedProducts = [];

  if (lower.includes('cart') || lower.includes('checkout') || lower.includes('total')) {
    if (cartItems.length === 0) {
      reply =
        "Your cart is currently empty! Would you like me to recommend some top-rated items from our catalog? For example, check out our popular beauty, fragrance, or electronics items.";
      matchedProducts = catalogProducts.filter((p) => p.rating >= 4.5).slice(0, 3);
    } else {
      reply = `You currently have ${cartItems.length} unique item${
        cartItems.length > 1 ? 's' : ''
      } in your cart with a subtotal of $${totalPrice.toFixed(2)}. ${
        totalPrice >= 50
          ? 'Great news: your order qualifies for Free Shipping!'
          : `You are only $${(50 - totalPrice).toFixed(2)} away from qualifying for Free Shipping!`
      } Would you like suggestions for complementary items?`;
      const cartCats = cartItems.map((c) => c.category);
      matchedProducts = catalogProducts
        .filter((p) => !cartItems.some((ci) => ci.id === p.id) && cartCats.includes(p.category))
        .slice(0, 2);
    }
  } else if (lower.includes('gift') || lower.includes('present')) {
    reply =
      "Here are some wonderful, universally loved gift ideas under $50 that our shoppers frequently recommend:";
    matchedProducts = catalogProducts.filter((p) => p.price <= 50 && p.rating >= 4.2).slice(0, 3);
  } else if (lower.includes('deal') || lower.includes('discount') || lower.includes('sale') || lower.includes('cheap') || lower.includes('best')) {
    reply =
      "I've scouted the top-value deals right now across the store with standout ratings:";
    matchedProducts = [...catalogProducts]
      .sort((a, b) => b.rating - a.rating || a.price - b.price)
      .slice(0, 3);
  } else if (currentProduct && (lower.includes('this') || lower.includes('buy') || lower.includes('recommend') || lower.includes('review'))) {
    reply = `"${currentProduct.title}" is rated ★ ${Number(currentProduct.rating).toFixed(1)}/5. It features ${
      currentProduct.stock > 0 ? `${currentProduct.stock} units currently in stock` : 'limited availability'
    } at $${Number(currentProduct.price).toFixed(2)}. It's a great match if you are shopping for quality ${
      currentProduct.category
    }.`;
    matchedProducts = catalogProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 2);
  } else {
    // General helpful shopping response
    reply =
      "I'm here to assist your shopping experience! You can ask me to analyze your cart, find the best deals under a specific budget, recommend gift ideas, or compare items.";
    matchedProducts = catalogProducts.slice(0, 2);
  }

  return {
    text: reply,
    recommendedProducts: matchedProducts,
    isAiGenerated: false,
  };
}
