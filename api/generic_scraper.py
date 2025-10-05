import sys
import json
import os
import re
import requests
from bs4 import BeautifulSoup

# Optional: enable Selenium if dynamic content is needed
USE_SELENIUM = False
if USE_SELENIUM:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options

if len(sys.argv) != 3:
    print("Usage: python3 generic_scraper.py <URL> <output_json_path>")
    sys.exit(1)

URL = sys.argv[1]
OUTPUT_JSON = sys.argv[2]


def fetch_html(url: str) -> str:
    """Fetch page HTML either with requests or Selenium if dynamic content is needed."""
    if USE_SELENIUM:
        options = Options()
        options.add_argument("--headless")
        driver = webdriver.Chrome(service=ChromeService(), options=options)
        driver.get(url)
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        html = driver.page_source
        driver.quit()
        return html
    else:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        return resp.text

def clean_text(text: str) -> str:
    """Collapse whitespace and strip blank/empty lines."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_meaningful_content(soup: BeautifulSoup) -> list:
    """Extract visible content from meaningful tags like headings, paragraphs, list items, links."""
    content = []
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.extract()

    tags = soup.find_all(["h1","h2","h3","h4","h5","h6","p","div","li","a"])
    for tag in tags:
        text = clean_text(tag.get_text(separator=" ", strip=True))
        if len(text) >= 3:
            content.append({"tag": tag.name, "text": text})
    return content

def main():
    html = fetch_html(URL)
    soup = BeautifulSoup(html, "html.parser")

    data = {
        "url": URL,
        "extracted_content": extract_meaningful_content(soup),
    }

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved extracted content to {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
