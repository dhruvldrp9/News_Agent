
import requests
from bs4 import BeautifulSoup
import re
import chardet


class WebScraper:
    def __init__(self):
        """
        Initialize the web scraper with a target URL and output directory
        
        :param url: URL of the webpage to scrape
        :param output_dir: Directory to save scraped content
        """
        self.url = None

    def fetch_page_content(self) -> requests.Response:
        """
        Fetch the content of the webpage
        
        :return: Response object from requests
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(self.url, headers=headers)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            print(f"Error fetching page: {e}")
            return None

    def detect_encoding(self, filepath: str) -> str:
        """
        Detect the encoding of a file
        
        :param filepath: Path to the file
        :return: Detected encoding
        """
        with open(filepath, 'rb') as file:
            result = chardet.detect(file.read())
        return result['encoding'] or 'utf-8'

    def clean_text(self, text: str) -> str:
        """
        Clean extracted text using basic regex operations
        Remove HTML tags, scripts, and unnecessary whitespace
        
        :param text: Input text to clean
        :return: Cleaned text
        """
        # Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:\-\'"()]', ' ', text)
        
        # Remove excessive punctuation
        text = re.sub(r'[.,!?;:]{2,}', '.', text)
        
        # Clean up multiple spaces again
        text = re.sub(r'\s+', ' ', text.strip())
        
        return text

    def save_webpage_text(self, soup: BeautifulSoup):
        """
        Extract and save all text from the webpage
        
        :param soup: BeautifulSoup object of the webpage
        """
        text = soup.get_text(separator=' ', strip=True)
        cleaned_text = self.clean_text(text)

        return cleaned_text
        

    def scrape(self, url):
        """
        Main scraping method
        """
        try:
            # Fetch page content
            self.url = url
            response = self.fetch_page_content()
            if not response:
                return None
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Save webpage text
            return self.save_webpage_text(soup)
        except Exception as e:
            print(f"Error in scrape method for {url}: {str(e)}")
            return None
