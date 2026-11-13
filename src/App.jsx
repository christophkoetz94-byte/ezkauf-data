import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingBag, Check, Plus, Trash2, 
  MapPin, Sparkles, Flame, ChefHat, X, ListChecks, CheckCircle2, Store, Tag 
} from 'lucide-react';

// Umfangreiche Rezept-Datenbank mit Tags für intelligente Suche (z.B. "China", "Italien", "Fitness", "Schnell")
const STANDARD_REZEPTE = [
  // CHINA & ASIATISCH
  {
    id: 'china-nudeln-haehnchen',
    name: 'China-Nudeln mit Hähnchen & Gemüse',
    kategorie: 'China & Asia',
    zeit: '20 Min.',
    tags: ['china', 'asia', 'asiatisch', 'nudeln', 'wok', 'bratnudeln', 'geflügel', 'schnell'],
    zutaten: ['Mienudeln', 'Hähnchenbrust', 'Paprika', 'Karotten', 'Sojasauce', 'Frühlingszwiebeln', 'Knoblauch']
  },
  {
    id: 'china-eierreis',
    name: 'Gebratener China-Eierreis',
    kategorie: 'China & Asia',
    zeit: '15 Min.',
    tags: ['china', 'asia', 'asiatisch', 'reis', 'wok', 'vegetarisch', 'schnell', 'günstig'],
    zutaten: ['Basmatireis', 'Eier', 'Erbsen', 'Karotten', 'Sojasauce', 'Frühlingszwiebeln']
  },
  {
    id: 'sweet-sour-chicken',
    name: 'Hähnchen Süß-Sauer nach China-Art',
    kategorie: 'China & Asia',
    zeit: '25 Min.',
    tags: ['china', 'asia', 'asiatisch', 'süß sauer', 'reis', 'hähnchen', 'wok'],
    zutaten: ['Hähnchenbrust', 'Basmatireis', 'Paprika', 'Ananas', 'Zwiebeln', 'Tomatenmark', 'Zucker']
  },
  {
    id: 'thai-curry',
    name: 'Rotes Thai-Curry mit Hähnchen & Reis',
    kategorie: 'China & Asia',
    zeit: '25 Min.',
    tags: ['china', 'asia', 'asiatisch', 'thai', 'curry', 'kokos', 'scharf', 'fitness'],
    zutaten: ['Hähnchenbrust', 'Basmatireis', 'Kokosmilch', 'Paprika', 'Currypaste', 'Zucchini']
  },
  {
    id: 'teriyaki-lachs',
    name: 'Teriyaki-Lachs mit Sesam-Reis & Brokkoli',
    kategorie: 'China & Asia',
    zeit: '25 Min.',
    tags: ['china', 'asia', 'asiatisch', 'japanisch', 'fisch', 'lachs', 'fitness', 'protein'],
    zutaten: ['Lachsfilet', 'Basmatireis', 'Brokkoli', 'Sojasauce', 'Honig', 'Knoblauch']
  },

  // ITALIENISCH & PASTA
  {
    id: 'bolognese',
    name: 'Spaghetti Bolognese',
    kategorie: 'Italienisch',
    zeit: '30 Min.',
    tags: ['italienisch', 'pasta', 'nudeln', 'klassiker', 'hackfleisch'],
    zutaten: ['Hackfleisch', 'Spaghetti', 'Passierte Tomaten', 'Zwiebeln', 'Knoblauch', 'Parmesan']
  },
  {
    id: 'carbonara',
    name: 'Original Spaghetti Carbonara',
    kategorie: 'Italienisch',
    zeit: '20 Min.',
    tags: ['italienisch', 'pasta', 'nudeln', 'schnell', 'speck', 'käse'],
    zutaten: ['Spaghetti', 'Schinkenwürfel', 'Eier', 'Parmesan', 'Pfeffer']
  },
  {
    id: 'lasagne',
    name: 'Klassische Hackfleisch-Lasagne',
    kategorie: 'Italienisch',
    zeit: '50 Min.',
    tags: ['italienisch', 'pasta', 'ofen', 'auflauf', 'käse', 'hackfleisch'],
    zutaten: ['Hackfleisch', 'Lasagneplatten', 'Passierte Tomaten', 'Gouda', 'Milch', 'Butter', 'Mehl', 'Zwiebeln']
  },
  {
    id: 'penne-arrabbiata',
    name: 'Penne all’Arrabbiata (Scharf)',
    kategorie: 'Italienisch',
    zeit: '20 Min.',
    tags: ['italienisch', 'pasta', 'nudeln', 'vegetarisch', 'vegan', 'scharf', 'günstig', 'schnell'],
    zutaten: ['Penne', 'Gehackte Tomaten', 'Knoblauch', 'Chili', 'Olivenöl', 'Parmesan']
  },
  {
    id: 'tortellini-sahne',
    name: 'Tortellini alla Panna (Schinken-Sahne)',
    kategorie: 'Italienisch',
    zeit: '15 Min.',
    tags: ['italienisch', 'pasta', 'schnell', 'sahne', 'schinken', 'käse'],
    zutaten: ['Tortellini', 'Sahne', 'Kochschinken', 'Parmesan', 'Erbsen']
  },

  // FITNESS & HIGH PROTEIN
  {
    id: 'haehnchen-brokkoli-reis',
    name: 'Gym-Klassiker: Hähnchen, Reis & Brokkoli',
    kategorie: 'Fitness & Protein',
    zeit: '25 Min.',
    tags: ['fitness', 'protein', 'gym', 'mealprep', 'gesund', 'reis', 'hähnchen'],
    zutaten: ['Hähnchenbrust', 'Basmatireis', 'Brokkoli', 'Frischkäse', 'Knoblauch']
  },
  {
    id: 'thunfisch-wrap',
    name: 'High-Protein Thunfisch-Wraps',
    kategorie: 'Fitness & Protein',
    zeit: '10 Min.',
    tags: ['fitness', 'protein', 'schnell', 'kalt', 'wrap', 'fisch', 'snack'],
    zutaten: ['Tortilla Wraps', 'Thunfisch', 'Mais', 'Frischkäse', 'Salat', 'Tomaten']
  },
  {
    id: 'ruehrei-lachs',
    name: 'Protein-Rührei mit Räucherlachs & Vollkorntoast',
    kategorie: 'Fitness & Protein',
    zeit: '10 Min.',
    tags: ['fitness', 'protein', 'frühstück', 'schnell', 'eier', 'lachs'],
    zutaten: ['Eier', 'Räucherlachs', 'Vollkorntoast', 'Butter', 'Frühlingszwiebeln']
  },

  // BURGER, WRAPS & MEXIKANISCH
  {
    id: 'smash-burger',
    name: 'Homemade Smash Burger mit Cheddar',
    kategorie: 'Burger & Streetfood',
    zeit: '20 Min.',
    tags: ['burger', 'fastfood', 'cheatday', 'fleisch', 'rind', 'käse', 'streetfood'],
    zutaten: ['Rinderhackfleisch', 'Burger Buns', 'Cheddar', 'Tomaten', 'Salat', 'Zwiebeln', 'Gewürzgurken']
  },
  {
    id: 'chicken-fajitas',
    name: 'Mexikanische Chicken Fajitas',
    kategorie: 'Mexikanisch',
    zeit: '25 Min.',
    tags: ['mexikanisch', 'wrap', 'tortilla', 'hähnchen', 'paprika', 'streetfood'],
    zutaten: ['Hähnchenbrust', 'Tortilla Wraps', 'Paprika', 'Zwiebeln', 'Schmand', 'Gouda']
  },
  {
    id: 'chili-con-carne',
    name: 'Feuriges Chili con Carne',
    kategorie: 'Mexikanisch',
    zeit: '35 Min.',
    tags: ['mexikanisch', 'eintopf', 'hackfleisch', 'bohnen', 'scharf', 'mealprep'],
    zutaten: ['Hackfleisch', 'Kidneybohnen', 'Mais', 'Gehackte Tomaten', 'Zwiebeln', 'Knoblauch', 'Paprika']
  },
  {
    id: 'doener-teller',
    name: 'Homemade Hähnchen-Dönerteller mit Pommes',
    kategorie: 'Burger & Streetfood',
    zeit: '30 Min.',
    tags: ['döner', 'türkisch', 'streetfood', 'pommes', 'hähnchen', 'cheatday'],
    zutaten: ['Hähnchenbrust', 'Pommes', 'Salat', 'Tomaten', 'Gurke', 'Zwiebeln', 'Joghurt', 'Knoblauch']
  },

  // DEUTSCH & HAUSMANNSKOST
  {
    id: 'kartoffelgratin',
    name: 'Cremiges Käse-Kartoffelgratin',
    kategorie: 'Hausmannskost',
    zeit: '45 Min.',
    tags: ['deutsch', 'ofen', 'auflauf', 'kartoffeln', 'käse', 'vegetarisch'],
    zutaten: ['Kartoffeln', 'Sahne', 'Gouda', 'Knoblauch', 'Butter']
  },
  {
    id: 'kaesespaetzle',
    name: 'Allgäuer Käsespätzle mit Röstzwiebeln',
    kategorie: 'Hausmannskost',
    zeit: '20 Min.',
    tags: ['deutsch', 'käse', 'vegetarisch', 'schnell', 'spätzle', 'soulfood'],
    zutaten: ['Spätzle', 'Emmentaler', 'Zwiebeln', 'Butter', 'Sahne']
  },
  {
    id: 'currywurst-pommes',
    name: 'Kölner Currywurst mit Pommes',
    kategorie: 'Hausmannskost',
    zeit: '25 Min.',
    tags: ['deutsch', 'köln', 'imbiss', 'wurst', 'pommes', 'schnell'],
    zutaten: ['Bratwurst', 'Pommes', 'Ketchup', 'Passierte Tomaten', 'Currypulver']
  },
  {
    id: 'bauernfruehstueck',
    name: 'Deftiges Bauernfrühstück (Bratkartoffel-Pfanne)',
    kategorie: 'Hausmannskost',
    zeit: '25 Min.',
    tags: ['deutsch', 'kartoffeln', 'eier', 'speck', 'pfanne', 'günstig'],
    zutaten: ['Kartoffeln', 'Eier', 'Schinkenwürfel', 'Zwiebeln', 'Gewürzgurken']
  },

  // SÜSS & FRÜHSTÜCK
  {
    id: 'pfannkuchen',
    name: 'Klassische Pfannkuchen mit Apfelmus',
    kategorie: 'Süß & Frühstück',
    zeit: '20 Min.',
    tags: ['süß', 'frühstück', 'dessert', 'schnell', 'günstig', 'vegetarisch'],
    zutaten: ['Eier', 'Milch', 'Mehl', 'Zucker', 'Butter', 'Apfelmus']
  },
  {
    id: 'kaiserschmarrn',
    name: 'Fluffiger Kaiserschmarrn',
    kategorie: 'Süß & Frühstück',
    zeit: '25 Min.',
    tags: ['süß', 'österreich', 'dessert', 'vegetarisch', 'soulfood'],
    zutaten: ['Eier', 'Milch', 'Mehl', 'Zucker', 'Butter', 'Rosinen', 'Apfelmus']
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

  const direkterName = kandidaten.find(
    (k) =>
      typeof k === 'string' &&
      k.trim().length > 1 &&
      !['offers', 'items', 'deals', 'angebote', 'products'].includes(k.trim().toLowerCase())
  );

  return direkterName ? direkterName.trim() : 'REWE';
};

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
  const [activeTab, setActiveTab] = useState('gerichte'); // Startet direkt im smarten Gericht-Planer
  const [radius, setRadius] = useState(10);
  const [tourModus, setTourModus] = useState('split');

  // Rezepte (Standard + eigene gespeicherte Rezepte)
  const [eigeneRezepte, setEigeneRezepte] = useState(() => {
    try {
      const saved = localStorage.getItem('ezkauf_eigene_rezepte');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showEigenesRezeptModal, setShowEigenesRezeptModal] = useState(false);
  const [neuesRezeptName, setNeuesRezeptName] = useState('');
  const [neuesRezeptKategorie, setNeuesRezeptKategorie] = useState('Eigenes Rezept');
  const [neuesRezeptZutaten, setNeuesRezeptZutaten] = useState('');

  const alleRezepte = useMemo(() => {
    return [...eigeneRezepte, ...STANDARD_REZEPTE];
  }, [eigeneRezepte]);

  // Einkaufsliste
  const [einkaufsliste, setEinkaufsliste] = useState([
    { id: 'init-1', suchbegriff: 'Red Bull', erledigt: false },
    { id: 'init-2', suchbegriff: 'Vollmilch', erledigt: false }
  ]);
  const [produktSuche, setProduktSuche] = useState('');

  // Gericht-Suche & Auswahl
  const [gerichtSuche, setGerichtSuche] = useState('');
  const [ausgewaehltesGericht, setAusgewaehltesGericht] = useState(STANDARD_REZEPTE[0]);
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

  const angeboteImRadius = useMemo(() => {
    return angebote.filter((a) => a.entfernung <= radius);
  }, [angebote, radius]);

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

  // Intelligente Live-Suche für Gerichte (durchsucht Name, Kategorie, Tags & Zutaten + zählt Live-Deals!)
  const gerichtVorschlaege = useMemo(() => {
    const q = gerichtSuche.toLowerCase().trim();
    const treffer = !q
      ? alleRezepte
      : alleRezepte.filter((g) => {
          const matchName = g.name.toLowerCase().includes(q);
          const matchKat = g.kategorie.toLowerCase().includes(q);
          const matchTags = (g.tags || []).some((t) => t.toLowerCase().includes(q));
          const matchZutat = g.zutaten.some((z) => z.toLowerCase().includes(q));
          return matchName || matchKat || matchTags || matchZutat;
        });

    // Jedes Rezept direkt mit der Anzahl der aktuell reduzierten Zutaten anreichern
    return treffer.map((rezept) => {
      const angebotsTreffer = rezept.zutaten.filter((z) =>
        angeboteImRadius.some((a) => a.name.toLowerCase().includes(z.toLowerCase()))
      ).length;
      return {
        ...rezept,
        angebotsTreffer
      };
    });
  }, [gerichtSuche, alleRezepte, angeboteImRadius]);

  // Preisberechnung: Split-Tour vs. All-in-One
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
    const zielMarktAllInOne = berechnung.besterEinzelMarkt?.markt || '';

    const angereicherteListe = einkaufsliste.map((item) => {
      const alleTreffer = angeboteImRadius
        .filter((a) => a.name.toLowerCase().includes(item.suchbegriff.toLowerCase()))
        .sort((a, b) => a.preis - b.preis);

      const bestesSplitAngebot = alleTreffer[0] || null;
      const bestesAllInOneAngebot =
        alleTreffer.find((t) => t.markt.toLowerCase() === zielMarktAllInOne.toLowerCase()) || null;

      const weitereMaerkte = Array.from(
        new Set(
          alleTreffer
            .map((t) => t.markt)
            .filter((m) => m.toLowerCase() !== (bestesSplitAngebot?.markt || '').toLowerCase())
        )
      );

      const aktiverDeal = tourModus === 'split' ? bestesSplitAngebot : bestesAllInOneAngebot;

      return {
        ...item,
        aktiverDeal,
        weitereMaerkte
      };
    });

    return {
      ...berechnung,
      angereicherteListe
    };
  }, [einkaufsliste, angeboteImRadius, verfuegbareMaerkte, tourModus]);

  // Analyse des ausgewählten Gerichts
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
    }, 800);
  };

  const eigenesRezeptSpeichern = (e) => {
    e.preventDefault();
    if (!neuesRezeptName.trim() || !neuesRezeptZutaten.trim()) return;
    const zutatenArray = neuesRezeptZutaten
      .split(/,|\n/)
      .map((z) => z.trim())
      .filter(Boolean);

    if (zutatenArray.length === 0) return;

    const neuesRezept = {
      id: 'custom-' + Date.now(),
      name: neuesRezeptName.trim(),
      kategorie: neuesRezeptKategorie.trim() || 'Eigenes Rezept',
      zeit: 'Individuell',
      tags: [neuesRezeptName.toLowerCase(), neuesRezeptKategorie.toLowerCase(), ...zutatenArray.map((z) => z.toLowerCase())],
      zutaten: zutatenArray
    };

    const updated = [neuesRezept, ...eigeneRezepte];
    setEigeneRezepte(updated);
    try {
      localStorage.setItem('ezkauf_eigene_rezepte', JSON.stringify(updated));
    } catch {}

    setAusgewaehltesGericht(neuesRezept);
    setNeuesRezeptName('');
    setNeuesRezeptZutaten('');
    setShowEigenesRezeptModal(false);
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

  const schnellTags = ['China', 'Italienisch', 'Fitness', 'Burger', 'Schnell', 'Hausmannskost'];

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

        {/* TAB 1: INTELLIGENTER GERICHT-FINDER (GENAU WIE DIE PRODUKTSUCHE!) */}
        {activeTab === 'gerichte' && (
          <div className="space-y-6">
            {/* Smarte Suchleiste mit Live-Dropdown */}
            <div className="relative z-20 space-y-2.5">
              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center bg-[#0E131F] border border-white/15 focus-within:border-amber-400/60 rounded-2xl px-4 py-3.5 shadow-xl">
                  <Search className="w-5 h-5 text-amber-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={gerichtSuche}
                    onChange={(e) => setGerichtSuche(e.target.value)}
                    placeholder="Worauf hast du Bock? (z.B. China, Curry, Nudeln, Burger, Fitness)..."
                    className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                  />
                  {gerichtSuche && (
                    <button onClick={() => setGerichtSuche('')} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowEigenesRezeptModal(!showEigenesRezeptModal)}
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-sky-300 flex items-center gap-1.5 shrink-0 transition"
                >
                  <Plus className="w-4 h-4" /> Eigenes Rezept
                </button>
              </div>

              {/* Schnell-Tags zum Antippen */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1 shrink-0">
                  <Tag className="w-3 h-3" /> Ideen:
                </span>
                {schnellTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setGerichtSuche(gerichtSuche.toLowerCase() === tag.toLowerCase() ? '' : tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition shrink-0 ${
                      gerichtSuche.toLowerCase() === tag.toLowerCase()
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Live-Dropdown: Wenn du z.B. "China" tippst, ploppen hier sofort alle passenden Gerichte auf! */}
              {gerichtSuche.trim().length > 0 && (
                <div className="bg-[#0D111A] border border-amber-400/30 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="px-4 py-2 bg-amber-400/10 border-b border-white/10 flex justify-between items-center text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    <span>Passende Gerichte für „{gerichtSuche}“ ({gerichtVorschlaege.length})</span>
                    <span>Angebots-Check</span>
                  </div>

                  {gerichtVorschlaege.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400 flex items-center justify-between">
                      <span>Kein vorgefertigtes Gericht gefunden – leg es einfach kurz selbst an!</span>
                      <button
                        onClick={() => {
                          setNeuesRezeptName(gerichtSuche);
                          setShowEigenesRezeptModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-semibold text-xs"
                      >
                        + Anlegen
                      </button>
                    </div>
                  ) : (
                    gerichtVorschlaege.map((gericht) => (
                      <button
                        key={gericht.id}
                        type="button"
                        onClick={() => {
                          setAusgewaehltesGericht(gericht);
                          setGerichtSuche('');
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.06] border-b border-white/5 last:border-none text-left transition"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30">
                              {gericht.kategorie}
                            </span>
                            <span className="text-xs text-slate-400">{gericht.zeit}</span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{gericht.name}</p>
                          <p className="text-xs text-slate-400 truncate">
                            Zutaten: {gericht.zutaten.join(', ')}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-400/15 text-sky-300 border border-sky-400/30">
                            {gericht.angebotsTreffer}/{gericht.zutaten.length} Deals
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Formular zum schnellen Anlegen eines eigenen Rezepts */}
            {showEigenesRezeptModal && (
              <form
                onSubmit={eigenesRezeptSpeichern}
                className="bg-[#0D111A] border border-sky-400/40 rounded-3xl p-5 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Neues Lieblingsgericht speichern</h3>
                  <button
                    type="button"
                    onClick={() => setShowEigenesRezeptModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={neuesRezeptName}
                    onChange={(e) => setNeuesRezeptName(e.target.value)}
                    placeholder="Name (z.B. China Bratnudeln Spezial)"
                    className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                  <input
                    type="text"
                    value={neuesRezeptKategorie}
                    onChange={(e) => setNeuesRezeptKategorie(e.target.value)}
                    placeholder="Kategorie / Tag (z.B. China & Asia)"
                    className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={neuesRezeptZutaten}
                  onChange={(e) => setNeuesRezeptZutaten(e.target.value)}
                  placeholder="Zutaten mit Komma trennen (z.B. Mienudeln, Hähnchenbrust, Paprika, Sojasauce)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-400 text-slate-950 font-bold text-xs hover:bg-sky-300 transition"
                >
                  Rezept speichern & Angebote prüfen
                </button>
              </form>
            )}

            {/* Ausgewähltes Gericht: Live-Zutatenabgleich & Übernahme auf Einkaufsliste */}
            {ausgewaehltesGericht && rezeptAnalyse && (
              <div className="bg-[#0D111A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
                        {ausgewaehltesGericht.kategorie}
                      </span>
                      <span className="text-xs text-slate-400">{ausgewaehltesGericht.zeit}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-1.5">{ausgewaehltesGericht.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Klicke eine Zutat an, wenn du sie schon zu Hause hast – den Rest schickst du auf deine Liste.
                    </p>
                  </div>

                  <button
                    onClick={rezeptAufEinkaufslisteUebernehmen}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-90 transition shadow-lg self-start sm:self-center shrink-0"
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

                {/* Preis-Vorschau direkt im Rezept */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/30">
                    <span className="text-[11px] font-semibold uppercase text-sky-300 block">
                      Split-Tour ({rezeptAnalyse.splitMaerkteListe.length || 1} Märkte)
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      {rezeptAnalyse.splitPreis.toFixed(2)} €
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                    <span className="text-[11px] font-semibold uppercase text-amber-300 block">
                      All-in-One ({rezeptAnalyse.besterEinzelMarkt.markt})
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      {rezeptAnalyse.besterEinzelMarkt.summe.toFixed(2)} €
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
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                            item.imVorrat
                              ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                              : 'border-white/25 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm truncate ${item.imVorrat ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.zutat}
                          </p>
                          {item.imVorrat ? (
                            <span className="text-xs text-emerald-400">Schon zu Hause im Vorrat</span>
                          ) : item.bestesAngebot ? (
                            <span className="text-xs text-sky-300 block truncate">
                              Deal: {item.bestesAngebot.name} ({item.bestesAngebot.entfernung} km)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Kein Sonderangebot – Standardpreis</span>
                          )}
                        </div>
                      </div>

                      {!item.imVorrat && (
                        <div className="text-right shrink-0">
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

        {/* TAB 2: EINKAUFSLISTE & EINZELPRODUKT-SUCHE */}
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
                    {tourModus === 'split'
                      ? 'Split-Modus: Zeigt für jedes Produkt den absolut billigsten Markt'
                      : `All-in-One-Modus: Zeigt dir die Angebote direkt bei ${einkaufsAnalyse.besterEinzelMarkt.markt}`}
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
                          {item.aktiverDeal ? (
                            <div className="space-y-0.5">
                              <span className="text-xs text-sky-300 block truncate">
                                Deal: {item.aktiverDeal.name} ({item.aktiverDeal.entfernung} km)
                              </span>
                              {tourModus === 'split' && item.weitereMaerkte.length > 0 && (
                                <span className="text-[11px] text-slate-400 block truncate">
                                  Auch im Angebot bei: {item.weitereMaerkte.join(', ')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">
                              {tourModus === 'allinone'
                                ? `Bei ${einkaufsAnalyse.besterEinzelMarkt.markt} nicht im Angebot (Normalpreis)`
                                : 'Kein aktuelles Angebot gefunden'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          {item.aktiverDeal ? (
                            <>
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border mb-0.5 ${getMarktBadgeStyle(item.aktiverDeal.markt)}`}>
                                {item.aktiverDeal.markt}
                              </span>
                              <p className="text-sm font-bold text-white">
                                {item.aktiverDeal.preis.toFixed(2)} €
                              </p>
                            </>
                          ) : (
                            <>
                              {tourModus === 'allinone' && (
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border mb-0.5 opacity-60 ${getMarktBadgeStyle(einkaufsAnalyse.besterEinzelMarkt.markt)}`}>
                                  {einkaufsAnalyse.besterEinzelMarkt.markt}
                                </span>
                              )}
                              <p className="text-sm font-medium text-slate-400">~{FALLBACK_REGALPREIS.toFixed(2)} €</p>
                            </>
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

        {/* TAB 3: ALLE LIVE-ANGEBOTE */}
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
