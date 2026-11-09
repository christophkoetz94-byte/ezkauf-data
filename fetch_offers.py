import json
import os
from datetime import datetime
import requests

# REWE Filiale Köln (z. B. Rodenkirchen / Südstadt)
REWE_MARKET_ID = "562286"


def get_rewe_offers():
    url = f"https://api.rewe.de/mobile/markets/{REWE_MARKET_ID}/offers"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }
    items = []
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            for cat in data.get("categories", []):
                for art in cat.get("articles", []):
                    # Normalisierte Datenstruktur für EZKauf
                    items.append(
                        {
                            "name": art.get("name", "").strip(),
                            "market": "REWE",
                            "price": art.get("price", {}).get("regular"),
                            "discount_price": art.get("price", {}).get(
                                "discount"
                            ),
                            "unit": art.get("_embedded", {})
                            .get("article", {})
                            .get("unit", ""),
                            "city": "Köln",
                        }
                    )
    except Exception as e:
        print(f"Fehler beim REWE Abruf: {e}")
    return items


def main():
    print("Starte Angebot-Sync für Köln...")
    rewe_items = get_rewe_offers()

    dataset = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "city": "Köln",
        "total_offers": len(rewe_items),
        "offers": rewe_items,
    }

    # Ordner public erstellen und JSON speichern
    os.makedirs("public", exist_ok=True)
    with open("public/angebote_koeln.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    print(
        f"Erfolg! {len(rewe_items)} Angebote in public/angebote_koeln.json abgelegt."
    )


if __name__ == "__main__":
    main()
