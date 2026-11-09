import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Store, 
  CheckCircle2, 
  Layers, 
  TrendingDown, 
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';

const MARKET_COLORS = {
  'REWE': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', badge: 'bg-red-500' },
  'ALDI Süd': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', badge: 'bg-blue-600' },
  'Lidl': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', badge: 'bg-yellow-500 text-black' }
};

const DEFAULT_STANDARD_PRICES = {
  'fleischwurst': { 'Lidl': 1.89, 'ALDI Süd': 1.95, 'REWE': 2.09 },
  'spaghetti': { 'Lidl': 0.65, 'ALDI Süd': 0.69, 'REWE': 0.79 },
  'milch': { 'Lidl': 0.99, 'ALDI Süd': 0.99, 'REWE': 1.05 },
  'butter': { 'Lidl': 1.39, 'ALDI Süd': 1.45, 'REWE': 1.59 },
  'eier': { 'Lidl': 1.99, 'ALDI Süd': 1.99, 'REWE': 2.19 }
};

export default function App() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [tourStrategy, setTourStrategy] = useState('smart'); // 'single', 'smart', 'all'
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'cart', 'recipes'
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  const DATA_URL = "https://raw.githubusercontent.com/christophkoetz94-byte/ezkauf-data/main/public/angebote_koeln.json";

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(DATA_URL + '?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (e) {
      console.error("Fehler beim Laden der Angebote:", e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Alle', 'Obst', 'Gemüse', 'Fleisch', 'Wurst', 'Molkerei', 'Käse', 'Nudeln', 'Getränke', 'Snacks'];

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.name.toLowerCase() === product.name.toLowerCase());
      if (exists) {
        return prev.map(item => 
          item.name.toLowerCase() === product.name.toLowerCase() 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, id: Date.now() }];
    });
  };

  const removeFromCart = (name) => {
    setCart(prev => prev.filter(item => item.name !== name));
  };

  const updateQuantity = (name, delta) => {
    setCart(prev => prev.map(item => {
      if (item.name === name) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  // Berechnungslogik für Tour-Strategien
  const calculateCartOptimization = () => {
    const markets = ['Lidl', 'ALDI Süd', 'REWE'];
    
    // Finde den Preis für ein Produkt in einem bestimmten Markt
    const getProductPriceInMarket = (productName, market) => {
      const norm = productName.toLowerCase();
      // 1. Suche in Live-Angeboten
      const offer = offers.find(o => 
        o.market === market && 
        (o.name.toLowerCase().includes(norm) || norm.includes(o.name.toLowerCase()))
      );
      if (offer) return offer.discount_price || offer.price;

      // 2. Suche in Standard-Fallback-Preisen
      for (const [key, prices] of Object.entries(DEFAULT_STANDARD_PRICES)) {
        if (norm.includes(key)) {
          return prices[market] || 2.49;
        }
      }
      return 2.49; // Generischer Default
    };

    // 1. Single Market (Alles in einem Markt)
    const singleMarketResults = markets.map(m => {
      let total = 0;
      cart.forEach(item => {
        total += getProductPriceInMarket(item.name, m) * item.quantity;
      });
      return { market: m, total };
    }).sort((a, b) => a.total - b.total);

    // 2. All 3 Markets (Maximaler Spartrip - jedes Produkt im billigsten Markt)
    let allMarketsTotal = 0;
    const allMarketsItems = cart.map(item => {
      let bestPrice = Infinity;
      let bestMarket = 'Lidl';
      markets.forEach(m => {
        const p = getProductPriceInMarket(item.name, m);
        if (p < bestPrice) {
          bestPrice = p;
          bestMarket = m;
        }
      });
      allMarketsTotal += bestPrice * item.quantity;
      return { ...item, chosenMarket: bestMarket, unitPrice: bestPrice };
    });

    // 3. Smart 2-Market Split (Beste Ersparnis bei maximal 2 Läden)
    const pairs = [
      ['Lidl', 'ALDI Süd'],
      ['Lidl', 'REWE'],
      ['ALDI Süd', 'REWE']
    ];
    let bestPair = pairs[0];
    let bestPairTotal = Infinity;

    pairs.forEach(pair => {
      let pairTotal = 0;
      cart.forEach(item => {
        const p1 = getProductPriceInMarket(item.name, pair[0]);
        const p2 = getProductPriceInMarket(item.name, pair[1]);
        pairTotal += Math.min(p1, p2) * item.quantity;
      });
      if (pairTotal < bestPairTotal) {
        bestPairTotal = pairTotal;
        bestPair = pair;
      }
    });

    return {
      single: singleMarketResults,
      bestPair: { markets: bestPair, total: bestPairTotal },
      allSplit: { total: allMarketsTotal, items: allMarketsItems }
    };
  };

  const optimization = calculateCartOptimization();

  const filteredOffers = offers.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Alle' || o.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 font-sans pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-black shadow-lg shadow-emerald-500/20">
              EZ
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">EZKauf</h1>
              <span className="text-[10px] text-emerald-400 font-medium">Köln • 345 Live-Deals</span>
            </div>
          </div>
          <button 
            onClick={fetchOffers}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-slate-400 hover:text-white"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Navigation Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/5">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'browse' ? 'bg-white/10 text-white shadow' : 'text-slate-400'}`}
          >
            Angebote
          </button>
          <button 
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'cart' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'}`}
          >
            Einkaufsliste ({cart.reduce((sum, i) => sum + i.quantity, 0)})
          </button>
        </div>

        {activeTab === 'browse' && (
          <>
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Fleischwurst, Kölsch, Barilla..." 
                className="w-full bg-[#12141C] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-emerald-500 text-black font-semibold' 
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Offers */}
            <div className="space-y-2">
              {filteredOffers.slice(0, 50).map((offer, idx) => {
                const conf = MARKET_COLORS[offer.market] || { bg: 'bg-white/5', text: 'text-white', border: 'border-white/10', badge: 'bg-slate-700' };
                return (
                  <div key={idx} className="bg-[#12141C] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-white/10 transition-all">
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${conf.badge} text-white`}>
                          {offer.market}
                        </span>
                        {offer.unit && <span className="text-[10px] text-slate-500">{offer.unit}</span>}
                      </div>
                      <h3 className="text-sm font-medium text-slate-200 line-clamp-1">{offer.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-base font-bold text-emerald-400">{offer.discount_price.toFixed(2)} €</span>
                        {offer.price && offer.price > offer.discount_price && (
                          <span className="text-xs text-slate-500 line-through">{offer.price.toFixed(2)} €</span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => addToCart(offer)}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 flex items-center justify-center transition-all text-slate-300"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'cart' && (
          <div>
            {/* Tour Strategy Switcher */}
            <div className="bg-[#12141C] border border-white/10 rounded-2xl p-3 mb-4">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Tour-Strategie</span>
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl">
                <button
                  onClick={() => setTourStrategy('single')}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                    tourStrategy === 'single' ? 'bg-white/20 text-white' : 'text-slate-400'
                  }`}
                >
                  1 Markt
                </button>
                <button
                  onClick={() => setTourStrategy('smart')}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                    tourStrategy === 'smart' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
                  }`}
                >
                  Max 2
                </button>
                <button
                  onClick={() => setTourStrategy('all')}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                    tourStrategy === 'all' ? 'bg-white/20 text-white' : 'text-slate-400'
                  }`}
                >
                  Alle 3
                </button>
              </div>

              {/* Best Strategy Recommendation Card */}
              <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                {tourStrategy === 'single' && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Bester Markt für alles</span>
                      <span className="text-sm font-bold text-white">{optimization.single[0]?.market || 'Lidl'}</span>
                    </div>
                    <span className="text-base font-bold text-emerald-400">{optimization.single[0]?.total.toFixed(2) || '0.00'} €</span>
                  </div>
                )}
                {tourStrategy === 'smart' && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Kombi: Max. 2 Stopps</span>
                      <span className="text-sm font-bold text-emerald-400">{optimization.bestPair.markets.join(' + ')}</span>
                    </div>
                    <span className="text-base font-bold text-emerald-400">{optimization.bestPair.total.toFixed(2)} €</span>
                  </div>
                )}
                {tourStrategy === 'all' && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Maximaler Spartrip (3 Märkte)</span>
                      <span className="text-sm font-bold text-amber-400">Tiefstpreis-Split</span>
                    </div>
                    <span className="text-base font-bold text-emerald-400">{optimization.allSplit.total.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Deine Einkaufsliste ist noch leer.<br />Füge Angebote hinzu oder nutze die Suche!
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-[#12141C] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">{item.name}</h4>
                      <span className="text-xs text-emerald-400 font-semibold">{((item.discount_price || item.price) * item.quantity).toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(item.name, -1)} 
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.name, 1)} 
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.name)} 
                        className="ml-2 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
