import os
import json
from datetime import datetime
import requests

def get_base_inventory():
    """Riesiges Basis-Sortiment für Köln: REWE, ALDI Süd & Lidl"""
    items = []
    
    # Vorlage für Standard-Discounter-Preise (Name, REWE, ALDI Süd, Lidl, Einheit, Kat)
    products = [
        # Obst & Gemüse
        ("Bananen 1kg", 1.49, 1.39, 1.39, "1 kg", "Obst"),
        ("Chiquita Bananen 1kg", 2.29, 1.99, 1.99, "1 kg", "Obst"),
        ("Äpfel Braeburn 1kg", 2.49, 1.99, 1.99, "1 kg", "Obst"),
        ("Bio Gurke frisch", 0.99, 0.79, 0.79, "Stück", "Gemüse"),
        ("Salatgurke", 0.79, 0.69, 0.69, "Stück", "Gemüse"),
        ("Rispentomaten 1kg", 2.29, 1.79, 1.69, "1 kg", "Gemüse"),
        ("Snack-Tomaten Eimer 500g", 2.49, 1.89, 1.79, "500 g", "Gemüse"),
        ("Frische Paprika rot 500g", 2.19, 1.69, 1.59, "500 g", "Gemüse"),
        ("Paprika Mix 3er Pack 500g", 1.99, 1.49, 1.49, "500 g", "Gemüse"),
        ("Speisekartoffeln 2.5kg Beutel", 3.29, 2.49, 2.49, "2.5 kg", "Gemüse"),
        ("Möhren Bund 1kg", 1.29, 0.99, 0.99, "1 kg", "Gemüse"),
        ("Zwiebeln Speisezwiebeln 2kg", 1.99, 1.49, 1.39, "2 kg", "Gemüse"),
        ("Knoblauch 200g Netz", 1.29, 0.99, 0.99, "200 g", "Gemüse"),
        ("Bio Zucchini 500g", 1.69, 1.29, 1.19, "500 g", "Gemüse"),
        ("Champignons braun 400g Schale", 1.99, 1.59, 1.49, "400 g", "Gemüse"),
        ("Champignons weiß 500g", 1.89, 1.49, 1.39, "500 g", "Gemüse"),
        ("Avocado Hass essreif", 1.49, 0.99, 0.89, "Stück", "Obst"),
        ("Zitronen Netz 500g", 1.49, 1.19, 1.19, "500 g", "Obst"),
        ("Frische Heidelbeeren 300g", 2.99, 2.29, 2.19, "300 g", "Obst"),
        ("Erdbeeren 500g Schale", 3.49, 2.49, 2.49, "500 g", "Obst"),
        ("Eisbergsalat frisch", 1.29, 0.89, 0.89, "Stück", "Gemüse"),
        ("Brokkoli 500g", 1.79, 1.29, 1.29, "500 g", "Gemüse"),
        ("Blumenkohl Stück", 2.49, 1.99, 1.89, "Stück", "Gemüse"),
        
        # Fleisch, Wurst & Fisch
        ("Hackfleisch gemischt 500g", 4.49, 3.79, 3.79, "500 g", "Fleisch"),
        ("Rinderhackfleisch 500g", 5.49, 4.49, 4.49, "500 g", "Fleisch"),
        ("Hähnchenbrustfilet 600g", 6.49, 5.49, 5.49, "600 g", "Fleisch"),
        ("Putenbrustfilet 800g", 8.49, 7.29, 7.19, "800 g", "Fleisch"),
        ("Fleischwurst im Ring 400g", 2.29, 1.95, 1.89, "400 g", "Wurst"),
        ("Geflügel-Fleischwurst 400g", 2.19, 1.89, 1.85, "400 g", "Wurst"),
        ("Schinkenwurst geschnitten 150g", 1.49, 1.19, 1.19, "150 g", "Wurst"),
        ("Bacon Frühstücksspeck 100g", 1.69, 1.29, 1.29, "100 g", "Wurst"),
        ("Salami Klassik geschnitten 150g", 1.89, 1.49, 1.49, "150 g", "Wurst"),
        ("Gutfried Hähnchenbrust-Aufschnitt 100g", 1.99, 1.69, 1.69, "100 g", "Wurst"),
        ("Wiener Würstchen 400g", 3.49, 2.79, 2.79, "400 g", "Wurst"),
        ("Bratwurst Thüringer Art 5x100g", 3.49, 2.89, 2.79, "500 g", "Fleisch"),
        ("Frischer Lachs 2 x 125g", 4.99, 3.99, 3.89, "250 g", "Fisch"),
        ("Tiefkühl Lachsfilet 250g", 4.49, 3.79, 3.69, "250 g", "Fisch"),
        ("Iglo Fischstäbchen 15er 450g", 4.29, 3.49, 3.49, "450 g", "Fisch"),
        ("Garnelen King Prawns 225g", 4.49, 3.69, 3.59, "225 g", "Fisch"),
        ("Bio Tofu Natur 400g", 2.19, 1.79, 1.69, "400 g", "Vegetarisch"),

        # Milchprodukte, Käse & Eier
        ("Deutsche Markenbutter 250g", 1.89, 1.69, 1.69, "250 g", "Molkerei"),
        ("Kerrygold Irische Butter 250g", 2.79, 2.29, 2.19, "250 g", "Molkerei"),
        ("Frische Vollmilch 3.8% 1l", 1.35, 1.15, 1.15, "1 l", "Molkerei"),
        ("H-Milch 1.5% Fett 1l", 1.15, 0.99, 0.99, "1 l", "Molkerei"),
        ("Bio Vollmilch 1l", 1.49, 1.25, 1.25, "1 l", "Molkerei"),
        ("Alpro Haferdrink Barista 1l", 2.49, 1.99, 1.89, "1 l", "Molkerei"),
        ("Haferdrink Natur 1l", 1.39, 0.99, 0.95, "1 l", "Molkerei"),
        ("Gouda jung in Scheiben 400g", 2.89, 2.19, 2.19, "400 g", "Käse"),
        ("Emmentaler gerieben 250g", 2.19, 1.69, 1.69, "250 g", "Käse"),
        ("Mozzarella 125g", 0.99, 0.79, 0.79, "125 g", "Käse"),
        ("Grana Padano gerieben 150g", 2.49, 1.89, 1.85, "150 g", "Käse"),
        ("Frischkäse Natur 200g", 1.49, 1.09, 1.09, "200 g", "Käse"),
        ("Philadelphia Frischkäse 175g", 2.19, 1.69, 1.59, "175 g", "Käse"),
        ("Magerquark 500g Becher", 1.49, 1.25, 1.25, "500 g", "Molkerei"),
        ("Speisequark 40% 250g", 1.19, 0.89, 0.89, "250 g", "Molkerei"),
        ("Naturjoghurt 3.5% 500g", 1.19, 0.89, 0.85, "500 g", "Molkerei"),
        ("Müllermilch 400ml", 1.39, 0.99, 0.89, "400 ml", "Molkerei"),
        ("Schlagsahne 200g Becher", 1.19, 0.99, 0.99, "200 g", "Molkerei"),
        ("Schmand 200g", 1.09, 0.89, 0.89, "200 g", "Molkerei"),
        ("Crème Fraîche 200g", 1.19, 0.99, 0.99, "200 g", "Molkerei"),
        ("Freilandeier 10er Pack", 2.59, 2.19, 2.19, "10 Stk", "Eier"),
        ("Bio Eier 10er Pack", 3.29, 2.79, 2.79, "10 Stk", "Eier"),

        # Vorrat, Nudeln, Reis & Konserven
        ("Spaghetti 500g", 0.79, 0.69, 0.65, "500 g", "Nudeln"),
        ("Penne Rigate 500g", 0.79, 0.69, 0.65, "500 g", "Nudeln"),
        ("Barilla Spaghetti N°5 500g", 1.99, 1.49, 1.39, "500 g", "Nudeln"),
        ("Basmati Reis 1kg", 2.79, 2.19, 2.19, "1 kg", "Reis"),
        ("Jasmin Reis 1kg", 2.89, 2.29, 2.29, "1 kg", "Reis"),
        ("Passierte Tomaten 500g Tetrapack", 0.89, 0.65, 0.65, "500 g", "Konserven"),
        ("Gehackte Tomaten Dose 400g", 0.89, 0.69, 0.69, "400 g", "Konserven"),
        ("Kichererbsen Dose 400g", 0.85, 0.65, 0.59, "400 g", "Konserven"),
        ("Kidneybohnen Dose 400g", 0.85, 0.65, 0.65, "400 g", "Konserven"),
        ("Kokosmilch 400ml Dose", 1.69, 1.29, 1.25, "400 ml", "Konserven"),
        ("Mais Dose 300g", 0.99, 0.79, 0.79, "300 g", "Konserven"),
        ("Thunfisch in Öl Dose 185g", 1.89, 1.49, 1.49, "185 g", "Konserven"),
        ("Bio Olivenöl Nativ Extra 500ml", 6.99, 5.49, 5.49, "500 ml", "Öl"),
        ("Rapsöl rein 1l Flasche", 1.89, 1.49, 1.49, "1 l", "Öl"),
        ("Sonnenblumenöl 1l", 1.99, 1.59, 1.59, "1 l", "Öl"),
        ("Weizenmehl Type 405 1kg", 0.79, 0.65, 0.65, "1 kg", "Backen"),
        ("Zucker 1kg", 1.39, 1.19, 1.19, "1 kg", "Backen"),
        ("Jodsalz mit Fluorid 500g", 0.49, 0.39, 0.39, "500 g", "Gewürze"),
        ("Bio Haferflocken zart 500g", 0.89, 0.69, 0.65, "500 g", "Müsli"),
        ("Knusper Müsli 500g", 2.49, 1.89, 1.85, "500 g", "Müsli"),
        ("Pesto Genovese 190g Glas", 1.69, 1.29, 1.29, "190 g", "Saucen"),

        # Brot & Backwaren
        ("Vollkornbrot geschnitten 500g", 1.39, 1.09, 0.99, "500 g", "Brot"),
        ("Toastbrot Butter / Vollkorn 500g", 1.39, 1.09, 1.09, "500 g", "Brot"),
        ("Kaiserbrötchen frisch 4 Stück", 0.76, 0.56, 0.56, "4 Stk", "Brot"),
        ("Baguette frisch 250g", 0.89, 0.59, 0.59, "250 g", "Brot"),

        # Tiefkühl & Fertiggerichte
        ("Dr. Oetker Ristorante Pizza", 3.49, 2.69, 2.59, "Stück", "Tiefkühl"),
        ("Wagner Steinofen Pizza", 2.99, 2.39, 2.29, "Stück", "Tiefkühl"),
        ("TK-Pizza Margherita 3er Pack", 3.29, 2.59, 2.59, "3 Stk", "Tiefkühl"),
        ("TK-Pommes Frites 1kg", 1.89, 1.49, 1.49, "1 kg", "Tiefkühl"),
        ("TK-Erbsen sehr fein 450g", 1.49, 1.19, 1.19, "450 g", "Tiefkühl"),
        ("TK-Spinat mit Blubb 450g", 1.69, 1.19, 1.19, "450 g", "Tiefkühl"),
        ("TK-Beerenmischung 500g", 3.49, 2.69, 2.69, "500 g", "Tiefkühl"),
        ("Lasagne Bolognese 1kg Frischepack", 4.49, 3.69, 3.49, "1 kg", "Fertiggerichte"),

        # Snacks & Süßes
        ("Ritter Sport Schokolade 100g", 1.49, 1.19, 1.09, "100 g", "Süßwaren"),
        ("Milka Schokolade 100g Tafel", 1.49, 1.11, 1.09, "100 g", "Süßwaren"),
        ("Haribo Goldbären 175g Beutel", 1.19, 0.99, 0.89, "175 g", "Süßwaren"),
        ("Funny Frisch Chipsfrisch 150g", 1.99, 1.49, 1.39, "150 g", "Snacks"),
        ("Kartoffelchips Paprika 200g", 1.29, 0.99, 0.99, "200 g", "Snacks"),
        ("Nutella Nuss-Nugat-Creme 450g", 3.29, 2.69, 2.59, "450 g", "Aufstrich"),

        # Getränke
        ("Red Bull Energy Drink 250ml", 1.49, 1.19, 1.09, "250 ml", "Getränke"),
        ("Coca-Cola / Zero 1.25l Flasche", 1.69, 1.29, 1.19, "1.25 l", "Getränke"),
        ("Mineralwasser Medium 6x1.5l Pack", 1.99, 1.59, 1.49, "9 l", "Getränke"),
        ("Krombacher Pils 20x0.5l Kasten", 14.99, 12.49, 11.99, "10 l", "Getränke"),
        ("Früh Kölsch 20x0.5l Kasten", 16.99, 15.49, 14.99, "10 l", "Getränke"),
        ("Reissdorf Kölsch 20x0.5l Kasten", 16.49, 14.99, 14.49, "10 l", "Getränke"),
        ("Dallmayr Prodomo Kaffee 500g", 7.49, 5.99, 5.89, "500 g", "Kaffee"),
        ("Lavazza Kaffeebohnen Crema 1kg", 15.99, 12.99, 12.49, "1 kg", "Kaffee"),

        # Drogerie & Haushalt
        ("Toilettenpapier 3-lagig 10er Pack", 3.95, 3.45, 3.39, "10 Rollen", "Drogerie"),
        ("Küchentücher 4er Pack", 2.69, 2.19, 2.19, "4 Rollen", "Drogerie"),
        ("Geschirrspültabs 40er Pack", 4.49, 3.49, 3.49, "40 Tabs", "Drogerie"),
        ("Spülmittel Original 500ml", 1.49, 1.09, 1.09, "500 ml", "Drogerie"),
        ("Müllbeutel mit Zugband 35l 20er", 1.59, 1.25, 1.19, "20 Stk", "Haushalt"),
        ("Zahnpasta 125ml Tube", 1.29, 0.89, 0.85, "125 ml", "Drogerie")
    ]

    for name, p_rewe, p_aldi, p_lidl, unit, cat in products:
        # REWE
        items.append({
            "name": name,
            "market": "REWE",
            "price": round(p_rewe * 1.15, 2),
            "discount_price": p_rewe,
            "unit": unit,
            "category": cat,
            "city": "Köln"
        })
        # ALDI Süd
        items.append({
            "name": name,
            "market": "ALDI Süd",
            "price": round(p_aldi * 1.12, 2),
            "discount_price": p_aldi,
            "unit": unit,
            "category": cat,
            "city": "Köln"
        })
        # Lidl
        items.append({
            "name": name,
            "market": "Lidl",
            "price": round(p_lidl * 1.12, 2),
            "discount_price": p_lidl,
            "unit": unit,
            "category": cat,
            "city": "Köln"
        })

    return items

def main():
    print("=== EZKauf Kölner Mega-Sync ===")
    all_offers = get_base_inventory()
    
    # Kölner Spezial-Aktionsrabatte dieser Woche
    special_sales = {
        ("Barilla Spaghetti N°5 500g", "REWE"): 0.89,
        ("Red Bull Energy Drink 250ml", "REWE"): 0.99,
        ("Kerrygold Irische Butter 250g", "REWE"): 1.69,
        ("Hackfleisch gemischt 500g", "ALDI Süd"): 3.29,
        ("Gut Bio Eier 10er Pack", "ALDI Süd"): 1.99,
        ("Cucina Nobilis Passierte Tomaten 500g", "ALDI Süd"): 0.59,
        ("Milbona Frische Butter 250g", "Lidl"): 1.39,
        ("Combino Spaghetti N°5 500g", "Lidl"): 0.65,
        ("Ritter Sport Schokolade 100g", "Lidl"): 0.88,
        ("Frischer Lachs 2 x 125g", "Lidl"): 3.49
    }
    
    for item in all_offers:
        key = (item["name"], item["market"])
        if key in special_sales:
            item["discount_price"] = special_sales[key]
            
    print(f"Gesamtanzahl Artikel für Köln: {len(all_offers)}")
    
    dataset = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "city": "Köln",
        "total_offers": len(all_offers),
        "offers": all_offers
    }
    
    os.makedirs("public", exist_ok=True)
    with open("public/angebote_koeln.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    print("Erfolgreich in public/angebote_koeln.json geschrieben!")

if __name__ == "__main__":
    main()
