import json
import os
from datetime import datetime
import requests

# Kölner Koordinaten (Köln Zentrum / Rheinland)
LAT = 50.9375
LON = 6.9603


def fetch_marktguru_offers():
    """Holt echte Kölner Wochenangebote via Marktguru API für REWE, ALDI Süd und Lidl"""
    offers = []
    target_retailers = ["rewe", "aldi süd", "lidl", "aldi"]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://www.marktguru.de/",
    }

    # Marktguru Offers API für den Raum Köln
    url = f"https://api.marktguru.de/api/v1/offers/search?as=web&limit=100&offset=0&zip=50667&lat={LAT}&lon={LON}"

    try:
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code == 200:
            data = res.json()
            results = data.get("results", [])

            for item in results:
                advertiser = (
                    item.get("advertiser", {}).get("name", "").strip()
                )
                advert
