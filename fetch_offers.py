import os
import json
import time
from datetime import datetime
from playwright.sync_api import sync_playwright

def scrape_with_browser():
    offers = []
    seen = set()
    
    print("Starte getarnten Chromium-Browser in Köln-Instanz...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled"
            ]
        )
        
        # Simuliere normalen deutschen Desktop-Browser
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="de-DE",
            geolocation={"latitude": 50.9375, "longitude": 6.9603}, # Köln Zentrum
            permissions=["geolocation"]
        )
        
        page = context.new_page()
        
        # Abfangen aller JSON-Responses, die Marktguru während des Surfens lädt
        def handle_response(response):
            if "offers" in response.url and response.status == 200:
                try:
                    data = response.json()
                    results = data.get("results", [])
                    for item in results:
                        adv = item.get("advertiser", {}).get("name", "").lower()
                        market = None
                        if "rewe" in adv: market = "REWE"
                        elif "aldi" in adv: market = "ALDI Süd"
                        elif "lidl" in adv: market = "Lidl"
                        
                        if market:
                            price = item.get("price")
                            old_price = item.get("oldPrice")
                            brand = item.get("brand", "")
                            desc = item.get("description", "")
                            title = f"{brand} {desc}".strip() or item.get("name", "Angebot")
                            
                            key = (title.lower(), market)
                            if key not in seen:
                                seen.add(key)
                                offers.append({
                                    "name": title,
                                    "market": market,
                                    "price": old_price if old_price else price,
                                    "discount_price": price,
                                    "unit": item.get("referenceUnit", ""),
                                    "city": "Köln"
                                })
                except Exception:
                    pass

        page.on("response", handle_response)
        
        # 1. Hauptseite für Kölner Angebote ansteuern
        try:
            print("Öffne Angebotsübersicht Köln...")
            page.goto("https://www.marktguru.de/angebote/50667", wait_until="networkidle", timeout=30000)
            time.sleep(3)
            
            # Etwas scrollen, um Lazy Loading anzustoßen
            for _ in range(4):
                page.mouse.wheel(0, 1000)
                time.sleep(1)
        except Exception as e:
            print(f"Hinweis beim Laden der Hauptseite: {e}")

        # 2. Gezielt Suchbegriffe im echten Browser durchgehen
        search_terms = ["Fleisch", "Milch", "Butter", "Käse", "Kaffee", "Pizza", "Schokolade", "Getränke", "Bier", "Obst"]
        for term in search_terms:
            try:
                print(f"Browser sucht nach: {term}...")
                page.goto(f"https://www.marktguru.de/suche?q={term}&zip=50667", wait_until="networkidle", timeout=25000)
                time.sleep(2)
                page.mouse.wheel(0, 800)
                time.sleep(1)
            except Exception as e:
                print(f"Fehler bei Suche nach {term}: {e}")

        browser.close()
        
    return offers

def main():
    print("=== Starte automatisierten Kölner Angebots-Crawler ===")
    live_offers = scrape_with_browser()
    print(f"Insgesamt gefundene Angebote über Browser: {len(live_offers)}")
    
    # Sicherheitsnetz: Falls Seitenstruktur geändert wurde, Basis-Wochenkatalog anhängen
    if len(live_offers) < 30:
        print("Ergänze Kölner Markt-Katalog...")
        # Lade vorhandene Angebote, falls vorhanden
        fallback_file = "public/angebote_koeln.json"
        if os.path.exists(fallback_file):
            with open(fallback_file, "r", encoding="utf-8") as f:
                old = json.load(f)
                existing = old.get("offers", [])
                for item in existing:
                    if (item["name"].lower(), item["market"]) not in {(o["name"].lower(), o["market"]) for o in live_offers}:
                        live_offers.append(item)

    dataset = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "city": "Köln",
        "total_offers": len(live_offers),
        "offers": live_offers
    }
    
    os.makedirs("public", exist_ok=True)
    with open("public/angebote_koeln.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    print(f"Erfolgreich {len(live_offers)} Angebote in public/angebote_koeln.json gesichert.")

if __name__ == "__main__":
    main()
