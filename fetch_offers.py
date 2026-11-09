import json
import os
from datetime import datetime
import requests


def get_koeln_offers():
    offers = []
    # Kölner Postleitzahl 50667 (Köln Zentrum / Rheinland)
    url = "https://api.marktguru.de/api/v1/offers/search?as=web&limit=100&offset=0&zip=50667"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            for item in data.get("results", []):
                advertiser = (
                    item.get("advertiser", {}).get("name", "").lower()
                )

                # Nur REWE, ALDI Süd und Lidl herausfiltern
                market_name = None
                if "rewe" in advertiser:
                    market_name = "REWE"
                elif "aldi" in advertiser:
                    market_name = "ALDI Süd"
                elif "lidl" in advertiser:
                    market_name = "Lidl"

                if market_name:
                    price = item.get("price")
                    old_price = item.get("oldPrice")
                    brand = item.get("brand", "")
                    description = item.get("description", "")
                    title = f"{brand} {description}".strip() or item.get(
                        "name", "Angebot"
                    )

                    offers.append(
                        {
                            "name": title,
                            "market": market_name,
                            "price": old_price if old_price else price,
                            "discount_price": price,
                            "unit": item.get("referenceUnit", ""),
                            "city": "Köln",
                        }
                    )
    except Exception as error:
        print(f"Fehler beim Laden: {error}")

    return offers


def main():
    print("Starte Kölner Angebots-Abruf...")
    data_list = get_koeln_offers()
    print(f"Erfolgreich {len(data_list)} Angebote für Köln gefunden.")

    result = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "city": "Köln",
        "total_offers": len(data_list),
        "offers": data_list,
    }

    os.makedirs("public", exist_ok=True)
    with open("public/angebote_koeln.json", "w", encoding="utf-8") as file:
        json.dump(result, file, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
