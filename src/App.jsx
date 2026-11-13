import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingBag, Utensils, Check, Plus, Trash2, 
  MapPin, Sparkles, ArrowRight, Store, Flame, ChefHat, X 
} from 'lucide-react';

// Vordefinierte Gerichte-Datenbank für den direkten Abgleich mit den Kölner Angeboten
const REZEPT_DATENBANK = [
  {
    id: 'bolognese',
    name: 'Spaghetti Bolognese',
    kategorie: 'Pasta',
    zeit: '30 Min.',
    zutaten: ['Hackfleisch', 'Spaghetti', 'Passierte Tomaten', 'Zwiebeln', 'Knoblauch', 'Parmesan']
  },
  {
    id: 'pfannkuchen',
    name: 'Klassische Pfannkuchen',
    kategorie: 'Süß & Schnell',
    zeit: '20 Min.',
    zutaten: ['Eier', 'Milch', 'Mehl', 'Zucker', 'Butter', 'Apfelmus']
  },
  {
    id: 'haehnchen-reis',
    name: 'Hähnchen-Curry mit Reis',
    kategorie: 'Fitness & Protein',
    zeit: '25 Min.',
    zutaten: ['Hähnchenbrust', 'Basmatireis', 'Kokosmilch', 'Paprika', 'Currypaste']
  },
  {
    id: 'burger',
    name: 'Homemade Smash Burger',
    kategorie: 'Cheatday',
    zeit: '20 Min.',
    zutaten: ['Rinderhackfleisch', 'Burger Buns', 'Cheddar', 'Tomaten', 'Salat', 'Zwiebeln']
  },
  {
    id: 'kartoffelgratin',
    name: 'Käse-Kartoffelgratin',
    kategorie: 'Ofengericht',
    zeit: '45 Min.',
    zutaten: ['Kartoffeln', 'Sahne', 'Gouda', 'Knoblauch', 'Butter']
  }
];

// Fallback-Daten, falls angebote_koeln.json lokal mal nicht direkt geladen wird
const FALLBACK_ANGEBOTE = [
  { id: 1, name: 'Gemischtes Hackfleisch 500g', preis: 3.49, markt: 'ALDI Süd', entfernung: 2.1, kategorie: 'Fleisch' },
  { id: 2, name: 'Barilla Spaghetti 500g', preis: 0.99, markt: 'REWE', entfernung: 1.4, kategorie: 'Vorrat' },
  { id: 3, name: 'Mutti Passierte Tomaten 400g', preis: 1.19, markt: 'Lidl', entfernung: 3.2, kategorie: 'Vorrat' },
  { id: 4, name: 'Freiland-Eier 10er Pack', preis: 2.29, markt: 'ALDI Süd', entfernung: 2.1, kategorie: 'Kühlung' },
  { id: 5, name: 'Frische Vollmilch 1L', preis: 0.95, markt: 'Lidl', entfernung: 3.2, kategorie: 'Kühlung' },
  { id: 6, name: 'Weizenmehl Type 405 1kg', preis: 0.69, markt: 'REWE', entfernung: 1.4, kategorie: 'Vorrat' },
  { id: 7, name: 'Hähnchenbrustfilet 400g', preis: 3.99, markt: 'Lidl', entfernung: 3.2, kategorie: 'Fleisch' },
  { id: 8, name: 'Jasmin / Basmatireis 1kg', preis: 1.79, markt: 'ALDI Süd', entfernung: 2.1, kategorie: 'Vorrat' },
  { id: 9, name: 'Kokosmilch 400ml', preis: 1.11, markt: 'REWE', entfernung: 1.4, kategorie: 'Vorrat' },
  { id: 10, name: 'Paprika Mix 500g', preis: 1.49, markt: 'ALDI Süd', entfernung: 2.1, kategorie: 'Obst & Gemüse' },
  { id: 11, name: 'Gouda Jung gerieben 250g', preis: 1.89, markt: 'Lidl', entfernung: 3.2, kategorie: 'Kühlung' },
  { id: 12, name: 'Festkochende Kartoffeln 2,5kg', preis: 2.49, markt: 'REWE', entfernung: 1.4, kategorie: 'Obst & Gemüse' }
];

export default function App() {
  const [angebote, setAngebote] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gerichte'); // 'gerichte' | 'angebote' | 'vorrat'
  const [radius, setRadius] = useState(10);
  
  // Gericht-Suche & Auswahl
  const [gerichtSuche, setGerichtSuche] = useState('');
  const [ausgewaehltesGericht, setAusgewaehltesGericht] = useState(REZEPT_DATENBANK[0]);
  const [tourModus, setTourModus] = useState('split'); // 'split' | 'allinone'

  // "Habe ich schon zu Hause" Vorrat
  const [vorrat, setVorrat] = useState(['Salz', 'Pfeffer', 'Öl', 'Zucker', 'Knoblauch']);
  const [neuerVorrat, setNeuerVorrat] = useState('');

  // Angebote aus deiner public/angebote_koeln.json laden
  useEffect(() => {
    fetch('/angebote_koeln.json')
      .then((res) => {
        if (!res.ok) throw new Error('JSON nicht gefunden');
        return res.json();
      })
      .then((data) => {
        // Normalisiert verschiedene mögliche JSON-Strukturen aus deinem Scraper
        const liste = Array.isArray(data) ? data : (data.angebote || data.items || []);
        const sauber = liste.map((item, idx) => ({
          id: item.id || idx + 1,
          name: item.name || item.title || item.produkt || 'Unbekanntes Angebot',
          preis: parseFloat(String(item.preis || item.price || 1.99).replace(',', '.')),
          markt: item.markt || item.supermarket || item.shop || 'REWE',
          entfernung: item.entfernung || Number(((idx % 12) + 1.2).toFixed(1)),
          kategorie: item.kategorie || 'Sonstiges'
        }));
        setAngebote(sauber.length > 0 ? sauber : FALLBACK_ANGEBOTE);
        setLoading(false);
      })
      .catch(() => {
        setAngebote(FALLBACK_ANGEBOTE);
        setLoading(false);
      });
  }, []);

  // Gefilterte Angebote nach Köln-Radius
  const angeboteImRadius = useMemo(() => {
    return angebote.filter((a) => a.entfernung <= radius);
  }, [angebote, radius]);

  // Gefilterte Gerichte nach Suchbegriff (sucht nach Gerichtname ODER Zutat!)
  const gefundeneGerichte = useMemo(() => {
    const q = gerichtSuche.toLowerCase().trim();
    if (!q) return REZEPT_DATENBANK;
    return REZEPT_DATENBANK.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.zutaten.some((z) => z.toLowerCase().includes(q))
    );
  }, [gerichtSuche]);

  // Smart-Matching: Zutaten des gewählten Gerichts vs. Vorrat vs. Supermarkt-Angebote
  const rezeptAnalyse = useMemo(() => {
    if (!ausgewaehltesGericht) return null;

    const zutatenDetails = ausgewaehltesGericht.zutaten.map((zutat) => {
      const imVorrat = vorrat.some(
        (v) => v.toLowerCase().includes(zutat.toLowerCase()) || zutat.toLowerCase().includes(v.toLowerCase())
      );

      // Passende Angebote im Radius finden
      const treffer = angeboteImRadius
        .filter((a) => a.name.toLowerCase().includes(zutat.toLowerCase()))
        .sort((a, b) => a.preis - b.preis);

      return {
        zutat,
        imVorrat,
        bestesAngebot: treffer[0] || null,
        alleTreffer: treffer
      };
    });

    const zuKaufen = zutatenDetails.filter((z) => !z.imVorrat);

    // Split-Tour Preis (überall das billigste Angebot mitnehmen)
    const splitPreis = zuKaufen.reduce((sum, item) => {
      return sum + (item.bestesAngebot ? item.bestesAngebot.preis : 1.79); // 1.79€ Fallback-Normalpreis
    }, 0);

    // All-in-One Preis (welcher EINZELNE Markt hat die meisten Treffer / besten Gesamtpreis?)
    const maerkte = ['REWE', 'ALDI Süd', 'Lidl'];
    const marktVergleich = maerkte.map((markt) => {
      let summe = 0;
      let angebotsTreffer = 0;
      zuKaufen.forEach((item) => {
        const marktAngebot = item.alleTreffer.find(
          (t) => t.markt.toLowerCase().includes(markt.toLowerCase())
        );
        if (marktAngebot) {
          summe += marktAngebot.preis;
          angebotsTreffer += 1;
        } else {
          summe += 1.89; // Standard-Regalpreis wenn nicht im Angebot
        }
      });
      return { markt, summe, angebotsTreffer };
    }).sort((a, b) => a.summe - b.summe);

    return {
      zutatenDetails,
      zuKaufenCount: zuKaufen.length,
      splitPreis,
      besterEinzelMarkt: marktVergleich[0],
      marktVergleich
    };
  }, [ausgewaehltesGericht, vorrat, angeboteImRadius]);

  const vorratHinzufuegen = (e) => {
    e.preventDefault();
    if (!neuerVorrat.trim()) return;
    if (!vorrat.includes(neuerVorrat.trim())) {
      setVorrat([...vorrat, neuerVorrat.trim()]);
    }
    setNeuerVorrat('');
  };

  const vorratToggle = (zutat) => {
    if (vorrat.some((v) => v.toLowerCase() === zutat.toLowerCase())) {
      setVorrat(vorrat.filter((v) => v.toLowerCase() !== zutat.toLowerCase()));
    } else {
      setVorrat([...vorrat, zutat]);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-sky-400/30 pb-24">
      {/* Ambient Apple-Style Glows (Babyblau & Gelb-Orange) */}
      <div className="fixed top-[-10%] left-[-10%] w-[450px] h-[450px] bg-sky-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#07090E]/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-amber-400 p-[1px]">
              <div className="w-full h-full bg-[#0D111A] rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-300 via-white to-amber-300 bg-clip-text text-transparent">
                EZKauf <span className="text-xs font-medium text-sky-400/90 ml-1">Köln Edition</span>
              </h1>
              <p className="text-xs text-slate-400">{angeboteImRadius.length} Live-Deals im Umkreis</p>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">Köln Radius:</span>
            <input
              type="range"
              min="5"
              max="15"
              step="1"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-20 accent-sky-400 cursor-pointer"
            />
            <span className="text-xs font-bold text-sky-300 w-9">{radius} km</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2">
          <button
            onClick={() => setActiveTab('gerichte')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'gerichte'
                ? 'bg-gradient-to-r from-sky-500/20 to-amber-500/20 text-white border border-sky-400/40 shadow-lg shadow-sky-500/10'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            Gericht-Planer
          </button>

          <button
            onClick={() => setActiveTab('vorrat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'vorrat'
                ? 'bg-sky-500/20 text-white border border-sky-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Check className="w-4 h-4 text-sky-400" />
            Zu Hause ({vorrat.length})
          </button>

          <button
            onClick={() => setActiveTab('angebote')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'angebote'
                ? 'bg-amber-500/20 text-white border border-amber-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Alle Angebote
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 relative z-10">
        
        {/* TAB 1: GERICHT-SUCHE & SMART PREISRECHNER */}
        {activeTab === 'gerichte' && (
          <div className="space-y-6">
            {/* Suchleiste für Gerichte */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400/40 to-amber-400/40 rounded-2xl blur opacity-50 group-focus-within:opacity-100 transition" />
              <div className="relative flex items-center bg-[#0E131F] border border-white/15 rounded-2xl px-4 py-3.5">
                <Search className="w-5 h-5 text-sky-400 mr-3" />
                <input
                  type="text"
                  value={gerichtSuche}
                  onChange={(e) => setGerichtSuche(e.target.value)}
                  placeholder="Nach Gericht oder Zutat suchen (z.B. Bolognese, Pfannkuchen, Hähnchen)..."
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                />
                {gerichtSuche && (
                  <button onClick={() => setGerichtSuche('')} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Horizontale Rezept-Karten */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {gefundeneGerichte.map((gericht) => {
                const aktiv = ausgewaehltesGericht?.id === gericht.id;
                return (
                  <button
                    key={gericht.id}
                    onClick={() => setAusgewaehltesGericht(gericht)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      aktiv
                        ? 'bg-gradient-to-br from-sky-500/15 to-amber-500/10 border-sky-400/50 shadow-lg shadow-sky-500/10'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                        {gericht.kategorie}
                      </span>
                      <span className="text-xs text-slate-400">{gericht.zeit}</span>
                    </div>
                    <h3 className="font-semibold text-white text-base mb-1">{gericht.name}</h3>
                    <p className="text-xs text-slate-400 truncate">
                      {gericht.zutaten.join(' • ')}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Detail-Auswertung & Tour-Modus */}
            {ausgewaehltesGericht && rezeptAnalyse && (
              <div className="bg-[#0D111A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-sky-300">Smart-Einkaufsliste</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-0.5">{ausgewaehltesGericht.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Klicke eine Zutat an, wenn du sie schon zu Hause hast – der Preis passt sich live an.
                    </p>
                  </div>

                  {/* Toggle: Split-Tour vs. All-in-One */}
                  <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 self-start">
                    <button
                      onClick={() => setTourModus('split')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        tourModus === 'split'
                          ? 'bg-sky-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Split-Tour ({rezeptAnalyse.splitPreis.toFixed(2)} €)
                    </button>
                    <button
                      onClick={() => setTourModus('allinone')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        tourModus === 'allinone'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All-in-One ({rezeptAnalyse.besterEinzelMarkt.summe.toFixed(2)} €)
                    </button>
                  </div>
                </div>

                {/* Preis-Ergebnis Banner */}
                <div className="rounded-2xl p-4 bg-gradient-to-r from-sky-500/10 via-white/[0.03] to-amber-500/10 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                  {tourModus === 'split' ? (
                    <div>
                      <p className="text-xs text-sky-300 font-medium">Maximale Ersparnis (Supermarkt-Hopping)</p>
                      <p className="text-sm text-slate-300 mt-0.5">
                        Du nimmst für jede fehlende Zutat das billigste Angebot im {radius} km Radius mit.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-amber-300 font-medium">
                        Bester Einzel-Stopp: <span className="font-bold text-white">{rezeptAnalyse.besterEinzelMarkt.markt}</span>
                      </p>
                      <p className="text-sm text-slate-300 mt-0.5">
                        Alles in einem Laden erledigt ({rezeptAnalyse.besterEinzelMarkt.angebotsTreffer} Zutaten dort im Angebot).
                      </p>
                    </div>
                  )}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Geschätzter Einkauf</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-sky-300 to-amber-300 bg-clip-text text-transparent">
                      {(tourModus === 'split'
                        ? rezeptAnalyse.splitPreis
                        : rezeptAnalyse.besterEinzelMarkt.summe
                      ).toFixed(2)}{' '}
                      €
                    </span>
                  </div>
                </div>

                {/* Zutaten-Checkliste */}
                <div className="space-y-2.5">
                  {rezeptAnalyse.zutatenDetails.map((item) => (
                    <div
                      key={item.zutat}
                      onClick={() => vorratToggle(item.zutat)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        item.imVorrat
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-65'
                          : 'bg-white/[0.03] border-white/10 hover:border-sky-400/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                            item.imVorrat
                              ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                              : 'border-white/25 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${item.imVorrat ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.zutat}
                          </p>
                          {item.imVorrat ? (
                            <span className="text-xs text-emerald-400">Schon zu Hause im Vorrat</span>
                          ) : item.bestesAngebot ? (
                            <span className="text-xs text-sky-300">
                              Deal: {item.bestesAngebot.name} ({item.bestesAngebot.entfernung} km)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Kein Sonderangebot – Standardpreis kalkuliert</span>
                          )}
                        </div>
                      </div>

                      {!item.imVorrat && (
                        <div className="text-right">
                          {item.bestesAngebot ? (
                            <>
                              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-0.5">
                                {item.bestesAngebot.markt}
                              </span>
                              <p className="text-sm font-bold text-white">
                                {item.bestesAngebot.preis.toFixed(2)} €
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-slate-400">~1.79 €</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VORRAT ("HABE ICH SCHON ZU HAUSE") */}
        {activeTab === 'vorrat' && (
          <div className="bg-[#0D111A] border border-white/10 rounded-3xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Dein Vorrat zu Hause</h2>
              <p className="text-xs text-slate-400">
                Alles, was hier steht, wird bei der Gericht-Suche automatisch als erledigt abgezogen.
              </p>
            </div>

            <form onSubmit={vorratHinzufuegen} className="flex gap-2">
              <input
                type="text"
                value={neuerVorrat}
                onChange={(e) => setNeuerVorrat(e.target.value)}
                placeholder="Zutat hinzufügen (z.B. Nudeln, Eier, Milch)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-sky-400 text-slate-950 font-semibold text-sm flex items-center gap-1.5 hover:bg-sky-300 transition"
              >
                <Plus className="w-4 h-4" /> Rein damit
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {vorrat.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200"
                >
                  {item}
                  <button
                    onClick={() => setVorrat(vorrat.filter((v) => v !== item))}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ALLE LIVE-ANGEBOTE */}
        {activeTab === 'angebote' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loading ? (
              <p className="text-sm text-slate-400">Lade Kölner Angebote...</p>
            ) : (
              angeboteImRadius.slice(0, 60).map((angebot) => (
                <div
                  key={angebot.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase">{angebot.markt}</span>
                    <h4 className="text-sm font-medium text-white">{angebot.name}</h4>
                    <span className="text-xs text-slate-400">{angebot.entfernung} km entfernt</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-sky-300">{angebot.preis.toFixed(2)} €</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
