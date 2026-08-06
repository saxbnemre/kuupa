import time
import requests
import re
import os
import urllib.robotparser
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import asyncio
import random
from playwright.async_api import async_playwright
from playwright_stealth import stealth
import pymongo
from datetime import datetime, timezone

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/kuupa')
USER_AGENT = 'kUUpaBot/1.0 (+https://kuupa.com/bot)'

COUPON_KEYWORDS = ['kupon', 'indirim', 'fırsat', 'kod', 'kampanya', 'discount', 'promo', 'code', 'voucher']
CODE_REGEX = re.compile(r'\b[A-Z0-9]{5,15}\b')

# Cache for robots.txt parsers
rp_cache = {}

async def simulate_human_behavior(page):
    """Simulates human-like behavior such as random mouse movements and scrolling."""
    # Random wait before starting
    await asyncio.sleep(random.uniform(1.0, 3.0))
    
    # Scroll down randomly
    for _ in range(random.randint(2, 5)):
        scroll_y = random.randint(300, 800)
        await page.mouse.wheel(0, scroll_y)
        await asyncio.sleep(random.uniform(0.5, 1.5))
        
    # Move mouse randomly
    for _ in range(random.randint(3, 7)):
        x = random.randint(100, 800)
        y = random.randint(100, 800)
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.1, 0.5))
        
    # Scroll back up a bit sometimes
    if random.choice([True, False]):
        await page.mouse.wheel(0, -random.randint(200, 500))
        await asyncio.sleep(random.uniform(0.5, 1.0))

def get_robot_parser(url):
    parsed = urlparse(url)
    domain = f"{parsed.scheme}://{parsed.netloc}"
    
    if domain in rp_cache:
        return rp_cache[domain]
        
    rp = urllib.robotparser.RobotFileParser()
    robots_url = urljoin(domain, '/robots.txt')
    rp.set_url(robots_url)
    try:
        # Some sites might block bots getting robots.txt, we try our best
        rp.read()
    except Exception as e:
        print(f"[WARN] Could not read robots.txt for {domain}: {e}")
        # We assume True but we still have backoff/rate limiting to be safe
        rp.allow_all = True
        
    rp_cache[domain] = rp
    return rp

def get_with_backoff(session, url, rp, max_retries=3):
    """Fetches a URL with exponential backoff and respects robots.txt delay"""
    # 1. Check robots.txt permission
    if not getattr(rp, 'allow_all', False) and not rp.can_fetch(USER_AGENT, url):
        print(f"[BLOCKED] robots.txt blocks fetching: {url}")
        return None
        
    # 2. Respect crawl delay if specified
    delay = rp.crawl_delay(USER_AGENT)
    if delay:
        print(f"[WAIT] Respecting crawl-delay of {delay}s...")
        time.sleep(delay)
    
    retries = 0
    backoff_time = 2 # Start with 2 seconds
    
    while retries <= max_retries:
        try:
            res = session.get(url, timeout=10)
            
            if res.status_code == 200:
                return res
            elif res.status_code == 429: # Too many requests
                print(f"[WAIT] 429 Too Many Requests for {url}. Backing off for {backoff_time}s...")
                time.sleep(backoff_time)
                retries += 1
                backoff_time *= 2 # Exponential backoff
            elif res.status_code >= 500: # Server error
                print(f"[WARN] Server error {res.status_code} for {url}. Retrying in {backoff_time}s...")
                time.sleep(backoff_time)
                retries += 1
                backoff_time *= 2
            else:
                print(f"[ERROR] Failed to fetch {url}. Status: {res.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"[WARN] Network error fetching {url}: {e}")
            time.sleep(backoff_time)
            retries += 1
            backoff_time *= 2
            
    print(f"[ERROR] Max retries reached for {url}")
    return None

async def fetch_with_playwright(browser_context, url):
    """Fetches a URL using Playwright with stealth and human-like behavior, ignoring robots.txt"""
    print(f"[INFO] Fetching {url} with Stealth Mode...")
    page = await browser_context.new_page()
    try:
        from playwright_stealth import Stealth
        await Stealth().apply_stealth_async(page)
        
        # Navigate to the page
        response = await page.goto(url, wait_until='domcontentloaded', timeout=30000)
        
        if response and response.status >= 400:
            print(f"[WARN] Page returned status {response.status} for {url}")
            
        # Simulate human behavior to bypass behavioral analysis
        await simulate_human_behavior(page)
        
        # Wait a bit more for dynamic content to load (like Vue/React components)
        await page.wait_for_timeout(random.randint(2000, 4000))
        
        # Get the full rendered HTML
        html_content = await page.content()
        return html_content
    except Exception as e:
        print(f"[ERROR] Playwright fetch failed for {url}: {e}")
        return None
    finally:
        await page.close()

def extract_codes_from_html(html):
    """Uses BeautifulSoup to intelligently extract codes near keyword elements"""
    soup = BeautifulSoup(html, 'html.parser')
    found_codes = set()
    
    # Clean up scripts and styles
    for script in soup(["script", "style"]):
        script.extract()
        
    # Find elements containing coupon keywords
    elements = soup.find_all(string=re.compile('|'.join(COUPON_KEYWORDS), flags=re.IGNORECASE))
    
    for element in elements:
        # Navigate up to the parent element to get context
        parent = element.parent
        if not parent:
            continue
            
        # Get text of the parent and its immediate siblings for context
        context_text = parent.get_text(separator=' ')
        for sibling in parent.next_siblings:
            if sibling.name:
                context_text += " " + sibling.get_text(separator=' ')
                
        matches = CODE_REGEX.findall(context_text)
        for match in matches:
            if not match.isdigit() and match not in ['INDIRIM', 'KAMPANYA', 'KUPON', 'DISCOUNT']:
                found_codes.add(match)
                
    return list(found_codes)

async def scrape_url(browser_context, url, target_domain):
    print(f"[INFO] Scraping {url} for {target_domain} coupons...")
    # We no longer strictly respect robots.txt for the aggressive scraper, 
    # but the get_robot_parser function is left in the code for future utility if needed.
    
    html_content = await fetch_with_playwright(browser_context, url)
    if not html_content:
        return []
        
    codes = extract_codes_from_html(html_content)
    return codes

def save_code_to_db(db, domain, code):
    """Saves the extracted code to MongoDB, adhering strictly to the Coupon schema"""
    try:
        now = datetime.now(timezone.utc)
        db.coupons.update_one(
            {'domain': domain, 'code': code},
            {
                '$setOnInsert': {
                    'discountType': 'UNKNOWN',
                    'isExpired': False,
                    'successRate': 100,
                    'failureCount': 0,
                    'discoveredBy': 'scraper',
                    'createdAt': now,
                },
                '$set': {
                    'updatedAt': now
                }
            },
            upsert=True
        )
        print(f"[SUCCESS] Saved {code} for {domain} to database")
    except Exception as e:
        print(f"[ERROR] Error saving {code}: {e}")

async def run_scraper_job():
    print("[START] Starting kUUpa Ethical Scraper Bot (Aggressive Stealth Mode)...")
    
    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Attempt to get default DB, fallback to 'kuupa' if URI doesn't specify
        db = client.get_default_database(default='kuupa')
        # Test connection
        client.admin.command('ping')
        print("[INFO] Connected to MongoDB successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        return
        
    # List of targets: (Source URL to scrape, Target e-commerce domain)
    # Testing with a dummy target since it's just for structural test
    targets = [
        ("https://www.reddit.com/r/coupons/new/", "amazon.com"),
    ]
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        
        # Create a context with a standard user agent
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        )
        
        for source_url, target_domain in targets:
            codes = await scrape_url(context, source_url, target_domain)
            print(f"[INFO] Found {len(codes)} potential codes on {source_url}")
            
            for code in codes:
                # Save to database in a blocking thread
                await asyncio.to_thread(save_code_to_db, db, target_domain, code)
                
        await context.close()
        await browser.close()
            
if __name__ == "__main__":
    # We run it once for testing
    asyncio.run(run_scraper_job())
    print("[END] Ethical scrape cycle completed.")
