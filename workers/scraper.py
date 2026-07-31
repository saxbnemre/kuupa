import time
import requests
import re
import os
import json
from urllib.parse import urlparse

API_URL = os.environ.get('API_URL', 'http://localhost:5000/api/v1')
EXTENSION_ID = os.environ.get('EXTENSION_ID', 'nmlnadapgmaphcelibelghibpinfmfng')

# Common words that appear near coupon codes
COUPON_KEYWORDS = ['kupon', 'indirim', 'fırsat', 'kod', 'kampanya', 'discount', 'promo', 'code', 'voucher']
# Regex to find potential codes: ALL CAPS or Mix of Caps/Numbers, 5-15 characters
CODE_REGEX = re.compile(r'\b[A-Z0-9]{5,15}\b')

def extract_text_from_html(html):
    # Simple regex to strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', html)
    # Remove extra whitespace
    return re.sub(r'\s+', ' ', text)

def scrape_url(url, target_domain):
    print(f"Scraping {url} for {target_domain} coupons...")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 kUUpaBot/1.0'
        }
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code != 200:
            print(f"Failed to fetch {url}. Status: {res.status_code}")
            return []
            
        text = extract_text_from_html(res.text)
        words = text.split()
        
        found_codes = set()
        
        # Scan through words, if we see a coupon keyword, look at nearby words for a code
        for i, word in enumerate(words):
            word_lower = word.lower()
            if any(kw in word_lower for kw in COUPON_KEYWORDS):
                # Look at 10 words before and after
                start = max(0, i - 10)
                end = min(len(words), i + 10)
                context = " ".join(words[start:end])
                
                matches = CODE_REGEX.findall(context)
                for match in matches:
                    # Filter out common false positives (pure numbers if too long, or common words)
                    if not match.isdigit() and match not in ['INDIRIM', 'KAMPANYA', 'KUPON']:
                        found_codes.add(match)
                        
        return list(found_codes)
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return []

def submit_code(domain, code):
    headers = {
        'Content-Type': 'application/json',
        'X-Extension-ID': EXTENSION_ID
    }
    payload = {
        'code': code,
        'discountType': 'UNKNOWN',
        'discoveredBy': 'kUUpa-Scraper-Bot'
    }
    try:
        res = requests.post(f"{API_URL}/store/{domain}/discover", headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ Successfully submitted {code} for {domain}")
        else:
            print(f"❌ Failed to submit {code}. Server said: {res.text}")
    except Exception as e:
        print(f"⚠️ Error submitting {code}: {e}")

def run_scraper_job():
    print("🚀 Starting kUUpa Global Scraper Bot...")
    
    # List of targets: (Source URL to scrape, Target e-commerce domain)
    # In a real scenario, these could be Reddit threads, DonanimHaber pages, Picodi pages etc.
    targets = [
        ("https://www.reddit.com/r/coupons/new/.json", "amazon.com"),
        # We can add actual forums here. For now we use some generic/public pages
    ]
    
    for source_url, target_domain in targets:
        codes = scrape_url(source_url, target_domain)
        print(f"Found {len(codes)} potential codes on {source_url}")
        
        for code in codes:
            submit_code(target_domain, code)
            time.sleep(1) # Rate limiting
            
if __name__ == "__main__":
    while True:
        run_scraper_job()
        print("💤 Sleeping for 1 hour before next scrape cycle...")
        time.sleep(3600) # Run every hour
