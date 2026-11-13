import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingBag, Check, Plus, Trash2, 
  MapPin, Sparkles, Flame, ChefHat, X, ListChecks, CheckCircle2, Store 
} from 'lucide-react';

// Vordefinierte Gerichte-Datenbank
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

// Fallback-Daten, falls weder GitHub noch lokale JSON erreichbar sind
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
  { id: 12, name: 'Festkochende Kartoffeln 2,5kg', preis: 2.49, markt: 'REWE', entfernung: 1.4, kategorie: 'Obst & Gemüse' },
  { id: 13, name: 'Red Bull Energy Drink 0,25l', preis: 0.88, markt: 'REWE', entfernung: 1.4, kategorie: 'Getränke' }
];

const FALLBACK_REGALPREIS = 1.79;

// Erkennt & normalisiert den Supermarkt zuverlässig aus jedem JSON-Item
const erkenneSupermarkt = (item, fallbackKey = '') => {
  const kandidaten = [
    item.markt,
    item.supermarket,
    item.supermarkt,
    item.market,
    item.shop,
    item.store,
    item.retailer,
    item.chain,
    item.haendler,
    item.merchant,
    item.provider,
    item.source,
    item.brand,
    Array.isArray(item.discounters) ? item.discounters[0] : item.discounters,
    fallbackKey
  ];

  // Alle Kandidaten + das gesamte JSON-Item als Text prüfen, falls der Markt verschachtelt steht
  const suchText = [
    ...kandidaten.filter(Boolean).map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))),
    JSON.stringify(item)
  ]
    .join(' ')
    .toLowerCase();

  if (suchText.includes('aldi')) return 'ALDI Süd';
  if (suchText.includes('rewe')) return 'REWE';
  if (suchText.includes('lidl')) return 'Lidl';
  if (suchText.includes('kaufland')) return 'Kaufland';
  if (suchText.includes('penny')) return 'Penny';
  if (suchText.includes('netto')) return 'Netto';
  if (suchText.includes('edeka')) return 'EDEKA';

  // Falls ein echter Name da ist, der nicht bloß "offers" oder "items" heißt
  const direkterName = kandidaten.find(
    (k) =>
      typeof k === 'string' &&
      k.trim().length > 1 &&
      !['offers', 'items', 'deals', 'angebote', 'products'].includes(k.trim().toLowerCase())
  );

  return direkterName ? direkterName.trim() : 'REWE';
};

// Farbige Markt-Badges (REWE = Rot, ALDI Süd = Babyblau, Lidl = Gelb/Orange)
const getMarktBadgeStyle = (markt) => {
  const m = String(markt || '').toLowerCase();
  if (m.includes('rewe')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  if (m.includes('aldi')) return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
  if (m.includes('lidl')) return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
  return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
};

export default function App() {
  const [angebote, setAngebote] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('einkaufsliste');
  const [radius, setRadius] = useState(10);
  const [tourModus, setTourModus] = useState('split');

  // Einkaufsliste
  const [einkaufsliste, setEinkaufsliste] = useState([
    { id: 'init-1', suchbegriff: 'Red Bull', erledigt: false },
    { id: 'init-2', suchbegriff: 'Vollmilch', erledigt: false }
  ]);
  const [produktSuche, setProduktSuche] = useState('');

  // Gericht-Suche & Auswahl
  const [gerichtSuche, setGerichtSuche] = useState('');
  const [ausgewaehltesGericht, setAusgewaehltesGericht] = useState(REZEPT_DATENBANK[0]);
  const [rezeptUebernommenMsg, setRezeptUebernommenMsg] = useState(false);

  // "Alle Angebote" Filter
  const [angebotsFilterSuche, setAngebotsFilterSuche] = useState('');
  const [marktFilter, setMarktFilter] = useState('ALLE');

  // Vorrat
  const [vorrat, setVorrat] = useState(['Salz', 'Pfeffer', 'Öl', 'Zucker', 'Knoblauch']);
  const [neuerVorrat, setNeuerVorrat] = useState('');

  // Live-Angebote aus GitHub-Repo (ezkauf-data) oder lokalem public-Ordner laden
  useEffect(() => {
    const quellen = [
      'https://raw.githubusercontent.com/christophkoetz94-byte/ezkauf-data/main/public/angebote_koeln.json',
      'https://raw.githubusercontent.com/christophkoetz94-byte/ezkauf-data/main/angebote_koeln.json',
      '/angebote_koeln.json'
    ];

    const ladeDaten = async () => {
      for (const url of quellen) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();

          let liste = [];
          if (Array.isArray(data)) {
            liste = data.map((entry) => ({ entry, wrapperKey: '' }));
          } else if (data && typeof data === 'object') {
            if (Array.isArray(data.offers)) {
              liste = data.offers.map((entry) => ({ entry, wrapperKey: '' }));
            } else if (Array.isArray(data.angebote)) {
              liste = data.angebote.map((entry) => ({ entry, wrapperKey: '' }));
            } else if (Array.isArray(data.items)) {
              liste = data.items.map((entry) => ({ entry, wrapperKey: '' }));
            } else if (Array.isArray(data.deals)) {
              liste = data.deals.map((entry) => ({ entry, wrapperKey: '' }));
            } else {
              Object.entries(data).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                  val.forEach((entry) => liste.push({ entry, wrapperKey: key }));
                }
              });
            }
          }

          if (liste.length > 0) {
            const sauber = liste.map(({ entry: item, wrapperKey }, idx) => {
              const rohPreis = String(item.preis ?? item.price ?? item.angebotspreis ?? '1.99')
                .replace('€', '')
                .replace(',', '.')
                .trim();
              const parsedPreis = parseFloat(rohPreis);

              return {
                id: item.id || idx + 1,
                name: item.name || item.title || item.produkt || item.artikel || 'Unbekanntes Angebot',
                preis: isNaN(parsedPreis) ? 1.99 : parsedPreis,
                markt: erkenneSupermarkt(item, wrapperKey),
                entfernung:
                  typeof item.entfernung === 'number'
                    ? item.entfernung
                    : Number(((idx % 10) + 1.1).toFixed(1)),
                kategorie: item.kategorie || item.category || 'Sonstiges'
              };
            });

            setAngebote(sauber);
            setLoading(false);
            return;
          }
        } catch {
          // Nächste Quelle probieren
        }
      }

      setAngebote(FALLBACK_ANGEBOTE);
      setLoading(false);
    };

    ladeDaten();
  }, []);

  // Gefilterte Angebote nach Köln-Radius
  const angeboteImRadius = useMemo(() => {
    return angebote.filter((a) => a.entfernung <= radius);
  }, [angebote, radius]);

  // Alle verfügbaren Märkte dynamisch ermitteln
  const verfuegbareMaerkte = useMemo(() => {
    const set = new Set(angeboteImRadius.map((a) => a.markt).filter(Boolean));
    return set.size > 0 ? Array.from(set) : ['REWE', 'ALDI Süd', 'Lidl'];
  }, [angeboteImRadius]);

  // Live-Vorschläge beim Tippen in der Einkaufsliste
  const produktVorschlaege = useMemo(() => {
    const q = produktSuche.toLowerCase().trim();
    if (q.length < 2) return [];
    return angeboteImRadius
      .filter((a) => a.name.toLowerCase().includes(q))
      .sort((a, b) => a.preis - b.preis)
      .slice(0, 6);
  }, [produktSuche, angeboteImRadius]);

  // Preisberechnung: Split-Tour (inkl. konkreter Liste der beteiligten Märkte!) vs. All-in-One
  const berechnePreise = (suchbegriffe) => {
    if (suchbegriffe.length === 0) {
      return {
        details: [],
        splitPreis: 0,
        splitMaerkteListe: [],
        besterEinzelMarkt: { markt: verfuegbareMaerkte[0] || 'REWE', summe: 0, angebotsTreffer: 0 }
      };
    }

    const details = suchbegriffe.map((begriff) => {
      const treffer = angeboteImRadius
        .filter((a) => a.name.toLowerCase().includes(begriff.toLowerCase()))
        .sort((a, b) => a.preis - b.preis);

      return {
        begriff,
        bestesAngebot: treffer[0] || null,
        alleTreffer: treffer
      };
    });

    const splitPreis = details.reduce((sum, item) => {
      return sum + (item.bestesAngebot ? item.bestesAngebot.preis : FALLBACK_REGALPREIS);
    }, 0);

    const maerkteMap = new Map();
    details.forEach((d) => {
      if (d.bestesAngebot && d.bestesAngebot.markt) {
        const key = d.bestesAngebot.markt.toLowerCase();
        if (!maerkteMap.has(key)) {
          maerkteMap.set(key, {
            markt: d.bestesAngebot.markt,
            anzahl: 1,
            summe: d.bestesAngebot.preis
          });
        } else {
          const eintrag = maerkteMap.get(key);
          eintrag.anzahl += 1;
          eintrag.summe += d.bestesAngebot.preis;
        }
      }
    });
    const splitMaerkteListe = Array.from(maerkteMap.values());

    const marktVergleich = verfuegbareMaerkte
      .map((markt) => {
        let summe = 0;
        let angebotsTreffer = 0;

        details.forEach((item) => {
          const marktAngebot = item.alleTreffer.find(
            (t) => t.markt.toLowerCase() === markt.toLowerCase()
          );
          if (marktAngebot) {
            summe += marktAngebot.preis;
            angebotsTreffer += 1;
          } else {
            summe += FALLBACK_REGALPREIS;
          }
        });

        return { markt, summe, angebotsTreffer };
      })
      .sort((a, b) => a.summe - b.summe || b.angebotsTreffer - a.angebotsTreffer);

    return {
      details,
      splitPreis,
      splitMaerkteListe,
      besterEinzelMarkt: marktVergleich[0] || {
        markt: verfuegbareMaerkte[0] || 'REWE',
        summe: splitPreis,
        angebotsTreffer: 0
      }
    };
  };

  // Analyse der aktiven Einkaufsliste
  const einkaufsAnalyse = useMemo(() => {
    const offeneItems = einkaufsliste.filter((i) => !i.erledigt);
    const berechnung = berechnePreise(offeneItems.map((i) => i.suchbegriff));

    const angereicherteListe = einkaufsliste.map((item) => {
      const treffer = angeboteImRadius
        .filter((a) => a.name.toLowerCase().includes(item.suchbegriff.toLowerCase()))
        .sort((a, b) => a.preis - b.preis);
      return {
        ...item,
        bestesAngebot: treffer[0] || null
      };
    });

    return {
      ...berechnung,
      angereicherteListe
    };
  }, [einkaufsliste, angeboteImRadius, verfuegbareMaerkte]);

  // Analyse des ausgewählten Gerichts
  const gefundeneGerichte = useMemo(() => {
    const q = gerichtSuche.toLowerCase().trim();
    if (!q) return REZEPT_DATENBANK;
    return REZEPT_DATENBANK.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.zutaten.some((z) => z.toLowerCase().includes(q))
    );
  }, [gerichtSuche]);

  const rezeptAnalyse = useMemo(() => {
    if (!ausgewaehltesGericht) return null;

    const zutatenDetails = ausgewaehltesGericht.zutaten.map((zutat) => {
      const imVorrat = vorrat.some(
        (v) => v.toLowerCase().includes(zutat.toLowerCase()) || zutat.toLowerCase().includes(v.toLowerCase())
      );
      const treffer = angeboteImRadius
        .filter((a) => a.name.toLowerCase().includes(zutat.toLowerCase()))
        .sort((a, b) => a.preis - b.preis);

      return {
        zutat,
        imVorrat,
        bestesAngebot: treffer[0] || null
      };
    });

    const zuKaufen = zutatenDetails.filter((z) => !z.imVorrat).map((z) => z.zutat);
    const preise = berechnePreise(zuKaufen);

    return {
      zutatenDetails,
      zuKaufen,
      ...preise
    };
  }, [ausgewaehltesGericht, vorrat, angeboteImRadius, verfuegbareMaerkte]);

  // Gefilterte Angebote für den "Alle Angebote" Tab
  const gefilterteAlleAngebote = useMemo(() => {
    return angeboteImRadius.filter((a) => {
      const matchMarkt = marktFilter === 'ALLE' || a.markt.toLowerCase().includes(marktFilter.toLowerCase());
      const matchText = !angebotsFilterSuche.trim() || a.name.toLowerCase().includes(angebotsFilterSuche.toLowerCase());
      return matchMarkt && matchText;
    });
  }, [angeboteImRadius, marktFilter, angebotsFilterSuche]);

  // Actions
  const produktZurListeHinzufuegen = (name) => {
    const clean = name.trim();
    if (!clean) return;
    setEinkaufsliste((prev) => [
      { id: Date.now() + Math.random(), suchbegriff: clean, erledigt: false },
      ...prev
    ]);
    setProduktSuche('');
  };

  const rezeptAufEinkaufslisteUebernehmen = () => {
    if (!rezeptAnalyse || rezeptAnalyse.zuKaufen.length === 0) return;
    const neueItems = rezeptAnalyse.zuKaufen.map((zutat, i) => ({
      id: Date.now() + i,
      suchbegriff: zutat,
      erledigt: false
    }));
    setEinkaufsliste((prev) => [...neueItems, ...prev]);
    setRezeptUebernommenMsg(true);
    setTimeout(() => {
      setRezeptUebernommenMsg(false);
      setActiveTab('einkaufsliste');
    }, 900);
  };

  const toggleItemErledigt = (id) => {
    setEinkaufsliste((prev) =>
      prev.map((item) => (item.id === id ? { ...item, erledigt: !item.erledigt } : item))
    );
  };

  const removeEinkaufsItem = (id) => {
    setEinkaufsliste((prev) => prev.filter((item) => item.id !== id));
  };

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
      {/* Ambient Glows */}
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
              <p className="text-xs text-slate-400">
                {loading ? 'Lade Live-Deals...' : `${angeboteImRadius.length} Live-Deals im Umkreis`}
              </p>
            </div>
          </div>

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
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('einkaufsliste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'einkaufsliste'
                ? 'bg-gradient-to-r from-sky-500/20 to-amber-500/20 text-white border border-sky-400/40 shadow-lg shadow-sky-500/10'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <ListChecks className="w-4 h-4 text-sky-400" />
            Einkaufsliste ({einkaufsliste.filter((i) => !i.erledigt).length})
          </button>

          <button
            onClick={() => setActiveTab('gerichte')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'gerichte'
                ? 'bg-gradient-to-r from-sky-500/20 to-amber-500/20 text-white border border-amber-400/40 shadow-lg shadow-amber-500/10'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            Gericht-Planer
          </button>

          <button
            onClick={() => setActiveTab('angebote')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'angebote'
                ? 'bg-amber-500/20 text-white border border-amber-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Alle Angebote
          </button>

          <button
            onClick={() => setActiveTab('vorrat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'vorrat'
                ? 'bg-sky-500/20 text-white border border-sky-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Zu Hause ({vorrat.length})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 relative z-10">

        {/* TAB 1: EINKAUFSLISTE & EINZELPRODUKT-SUCHE */}
        {activeTab === 'einkaufsliste' && (
          <div className="space-y-6">
            <div className="relative z-20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  produktZurListeHinzufuegen(produktSuche);
                }}
                className="relative flex items-center bg-[#0E131F] border border-white/15 focus-within:border-sky-400/60 rounded-2xl px-4 py-3 shadow-xl"
              >
                <Search className="w-5 h-5 text-sky-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={produktSuche}
                  onChange={(e) => setProduktSuche(e.target.value)}
                  placeholder="Einzelnes Produkt suchen oder hinzufügen (z.B. Red Bull, Hackfleisch, Eier)..."
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                />
                {produktSuche && (
                  <button
                    type="button"
                    onClick={() => setProduktSuche('')}
                    className="text-slate-400 hover:text-white mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-semibold text-xs hover:bg-sky-300 transition shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Hinzufügen
                </button>
              </form>

              {produktVorschlaege.length > 0 && (
                <div className="mt-2 bg-[#0D111A] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="px-4 py-2 bg-white/[0.03] border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Passende Live-Deals in Köln (Klicken zum Übernehmen)
                  </div>
                  {produktVorschlaege.map((deal) => (
                    <button
                      key={deal.id}
                      type="button"
                      onClick={() => produktZurListeHinzufuegen(deal.name)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.06] border-b border-white/5 last:border-none text-left transition"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getMarktBadgeStyle(deal.markt)}`}>
                            {deal.markt}
                          </span>
                          <span className="text-xs text-slate-400">{deal.entfernung} km</span>
                        </div>
                        <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-sky-300">{deal.preis.toFixed(2)} €</span>
                        <span className="p-1.5 rounded-lg bg-sky-400/15 text-sky-300">
                          <Plus className="w-4 h-4" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#0D111A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Deine Einkaufsliste</h2>
                  <p className="text-xs text-slate-400">
                    Automatischer Bestpreis-Abgleich für alle offenen Produkte
                  </p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 self-start">
                  <button
                    onClick={() => setTourModus('split')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      tourModus === 'split'
                        ? 'bg-sky-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Split-Tour ({einkaufsAnalyse.splitPreis.toFixed(2)} €)
                  </button>
                  <button
                    onClick={() => setTourModus('allinone')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      tourModus === 'allinone'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All-in-One ({einkaufsAnalyse.besterEinzelMarkt.summe.toFixed(2)} €)
                  </button>
                </div>
              </div>

              {/* Routen- & Markt-Übersicht Banner */}
              {einkaufsliste.filter((i) => !i.erledigt).length > 0 && (
                <div className="rounded-2xl p-4 bg-gradient-to-r from-sky-500/10 via-white/[0.03] to-amber-500/10 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                  {tourModus === 'split' ? (
                    <div className="space-y-2">
                      <p className="text-xs text-sky-300 font-semibold uppercase tracking-wider">
                        {einkaufsAnalyse.splitMaerkteListe.length === 0
                          ? 'Keine Angebots-Treffer im Radius'
                          : einkaufsAnalyse.splitMaerkteListe.length === 1
                          ? 'Split-Tour (Nur 1 Markt nötig)'
                          : `Split-Tour über ${einkaufsAnalyse.splitMaerkteListe.length} Märkte`}
                      </p>

                      {einkaufsAnalyse.splitMaerkteListe.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {einkaufsAnalyse.splitMaerkteListe.map((m) => (
                            <span
                              key={m.markt}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${getMarktBadgeStyle(m.markt)}`}
                            >
                              <Store className="w-3.5 h-3.5" />
                              {m.markt} ({m.anzahl}x • {m.summe.toFixed(2)} €)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-300">
                          Für die aktuellen Artikel wurden keine speziellen Sonderangebote gefunden.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-amber-300 font-medium">
                        Bester Einzel-Stopp:{' '}
                        <span className={`inline-block ml-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getMarktBadgeStyle(einkaufsAnalyse.besterEinzelMarkt.markt)}`}>
                          {einkaufsAnalyse.besterEinzelMarkt.markt}
                        </span>
                      </p>
                      <p className="text-sm text-slate-300 mt-1.5">
                        Alles in einem Laden erledigt ({einkaufsAnalyse.besterEinzelMarkt.angebotsTreffer} Treffer dort im Angebot).
                      </p>
                    </div>
                  )}

                  <div className="text-right ml-auto">
                    <span className="text-xs text-slate-400 block">Offene Summe</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-sky-300 to-amber-300 bg-clip-text text-transparent">
                      {(tourModus === 'split'
                        ? einkaufsAnalyse.splitPreis
                        : einkaufsAnalyse.besterEinzelMarkt.summe
                      ).toFixed(2)}{' '}
                      €
                    </span>
                  </div>
                </div>
              )}

              {/* Produkt-Liste */}
              {einkaufsAnalyse.angereicherteListe.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Deine Einkaufsliste ist leer. Such oben nach einem Produkt oder übernimm ein Gericht aus dem Planer!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {einkaufsAnalyse.angereicherteListe.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        item.erledigt
                          ? 'bg-white/[0.01] border-white/5 opacity-50'
                          : 'bg-white/[0.03] border-white/10 hover:border-sky-400/30'
                      }`}
                    >
                      <div
                        onClick={() => toggleItemErledigt(item.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                            item.erledigt
                              ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                              : 'border-white/25 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm truncate ${item.erledigt ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.suchbegriff}
                          </p>
                          {item.bestesAngebot ? (
                            <span className="text-xs text-sky-300 block truncate">
                              Deal: {item.bestesAngebot.name} ({item.bestesAngebot.entfernung} km)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Kein aktuelles Angebot gefunden</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          {item.bestesAngebot ? (
                            <>
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border mb-0.5 ${getMarktBadgeStyle(item.bestesAngebot.markt)}`}>
                                {item.bestesAngebot.markt}
                              </span>
                              <p className="text-sm font-bold text-white">
                                {item.bestesAngebot.preis.toFixed(2)} €
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-slate-400">~{FALLBACK_REGALPREIS.toFixed(2)} €</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeEinkaufsItem(item.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GERICHT-SUCHE & REZEPT-PLANER */}
        {activeTab === 'gerichte' && (
          <div className="space-y-6">
            <div className="relative flex items-center bg-[#0E131F] border border-white/15 focus-within:border-amber-400/60 rounded-2xl px-4 py-3.5">
              <Search className="w-5 h-5 text-amber-400 mr-3" />
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

            {ausgewaehltesGericht && rezeptAnalyse && (
              <div className="bg-[#0D111A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-sky-300">Rezept-Abgleich</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-0.5">{ausgewaehltesGericht.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Vorhandene Zutaten abhaken und den Rest direkt auf deine Einkaufsliste schicken.
                    </p>
                  </div>

                  <button
                    onClick={rezeptAufEinkaufslisteUebernehmen}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-90 transition shadow-lg self-start sm:self-center"
                  >
                    {rezeptUebernommenMsg ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Übernommen!
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Fehlende ({rezeptAnalyse.zuKaufen.length}) auf Einkaufsliste
                      </>
                    )}
                  </button>
                </div>

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
                            <span className="text-xs text-slate-500">Kein Sonderangebot – Standardpreis</span>
                          )}
                        </div>
                      </div>

                      {!item.imVorrat && (
                        <div className="text-right">
                          {item.bestesAngebot ? (
                            <>
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border mb-0.5 ${getMarktBadgeStyle(item.bestesAngebot.markt)}`}>
                                {item.bestesAngebot.markt}
                              </span>
                              <p className="text-sm font-bold text-white">
                                {item.bestesAngebot.preis.toFixed(2)} €
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-slate-400">~{FALLBACK_REGALPREIS.toFixed(2)} €</p>
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

        {/* TAB 3: ALLE LIVE-ANGEBOTE MIT DEUTLICHEM SUPERMARKT-BADGE & DIREKT-ADD */}
        {activeTab === 'angebote' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 flex items-center bg-[#0E131F] border border-white/15 rounded-2xl px-4 py-2.5">
                <Search className="w-4 h-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  value={angebotsFilterSuche}
                  onChange={(e) => setAngebotsFilterSuche(e.target.value)}
                  placeholder="In allen Kölner Angeboten filtern..."
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>

              <div className="flex gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto">
                {['ALLE', ...verfuegbareMaerkte].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarktFilter(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      marktFilter === m ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-400">Lade Kölner Angebote...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gefilterteAlleAngebote.slice(0, 120).map((angebot) => (
                  <div
                    key={angebot.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border ${getMarktBadgeStyle(angebot.markt)}`}>
                          <Store className="w-3 h-3" />
                          {angebot.markt}
                        </span>
                        <span className="text-xs text-slate-400">{angebot.entfernung} km</span>
                      </div>
                      <h4 className="text-sm font-medium text-white truncate">{angebot.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-bold text-sky-300">{angebot.preis.toFixed(2)} €</span>
                      <button
                        onClick={() => {
                          produktZurListeHinzufuegen(angebot.name);
                          setActiveTab('einkaufsliste');
                        }}
                        className="p-2 rounded-xl bg-sky-400/15 text-sky-300 hover:bg-sky-400 hover:text-slate-950 transition"
                        title="Auf die Einkaufsliste"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VORRAT ("HABE ICH SCHON ZU HAUSE") */}
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
      </main>
    </div>
  );
}
