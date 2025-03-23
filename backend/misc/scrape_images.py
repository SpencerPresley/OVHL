from typing import List
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin, urlparse

class ImageDownloader:
    def __init__(
        self,
        url: str,
        file_types: List[str],
        output_dir: str | None = None
    ):
        """Initialize the downloader

        Args:
            url (str): The webpage URL to scrape
            file_types (List[str]): List of file extensions to download (e.g., ['.svg', '.png'])
            output_dir (str | None): The directory to save the downloaded images to
        """
        self.url = url
        self.file_types = file_types
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.output_dir = self._get_output_dir(output_dir)
        
    def _get_output_dir(self, output_dir: str | None) -> str:
        """Get the output directory
        
        Checks if output_dir exists, if it does then ensures the output_dir directory exists, if it doesn't yet then it creates it and returns the original output_dir. If output_dir is not provided then it returns the current working directory.
        
        Args:
            output_dir (str | None): The output directory to use
            
        Returns:
            str: The output directory
        """
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            return output_dir
        return os.getcwd()
             
    def get_page_content(self) -> str | None:
        """Fetch the webpage content
        
        Returns:
            str | None: The webpage content
        """
        try:
            response = requests.get(self.url, headers=self.headers)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"Error fetching the page: {e}")
            return None

    def get_image_urls(self, html_content: str) -> List[str]:
        """Extract image URLs from the page
        
        Uses BeautifulSoup to parse the HTML content and find all img tags. Then it checks if the src attribute is present and if it is then it makes the URL absolute if it's relative. Then it checks if the file extension matches what we're looking for and if it does then it adds the URL to the list of image URLs.
        
        Args:
            html_content (str): The webpage content
            
        Returns:
            List[str]: A list of image URLs
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        images = []
        
        # Find all img tags
        for img in soup.find_all('img'):
            src = img.get('src')
            if src:
                # Make URL absolute if it's relative
                full_url = urljoin(self.url, src)
                # Check if the file extension matches what we're looking for
                if any(full_url.lower().endswith(ext) for ext in self.file_types):
                    images.append(full_url)
        return images

    def download_image(self, image_url: str) -> bool:
        """Download a single image
        
        Tries to download the image from the given URL. If the image is downloaded successfully then it saves the image to the output directory and returns True. If the image is not downloaded successfully then it prints an error message and returns False.
        
        Args:
            image_url (str): The URL of the image to download
            
        Returns:
            bool: True if the image was downloaded successfully, False otherwise
        """
        try:
            response = requests.get(image_url, headers=self.headers)
            response.raise_for_status()
            
            # Extract filename from URL
            filename = os.path.basename(urlparse(image_url).path)
            
            full_path = os.path.join(self.output_dir, filename)
            
            # Save the image
            with open(full_path, 'wb') as f:
                f.write(response.content)
            print(f"Successfully downloaded: {filename}, path: {full_path}")
            return True
        except requests.RequestException as e:
            print(f"Error downloading {image_url}: {e}")
            return False

    def download_all_images(self):
        """Main method to download all images
        
        Gets the webpage content, if the webpage content is not found then it returns False. Then it gets the image URLs, if no image URLs are found then it prints a message and returns False. Then it downloads the images, if the images are downloaded successfully then it prints a message and returns True.
        """
        html_content = self.get_page_content()
        if not html_content:
            return False

        image_urls = self.get_image_urls(html_content)
        if not image_urls:
            print("No matching images found on the page")
            return False

        print(f"Found {len(image_urls)} images to download")
        success_count = 0
        for url in image_urls:
            if self.download_image(url):
                success_count += 1

        print(f"\nDownload complete. Successfully downloaded {success_count} of {len(image_urls)} images")
        return True

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Download images from a webpage")
    parser.add_argument(
        "url",
        type=str,
        help="The URL of the webpage to download images from"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        help="The directory to save the downloaded images to",
        default='images'
    )
    parser.add_argument(
        "--file-types",
        type=lambda x: x.split(','),
        help="The file types to download",
        default='.svg,.png'
    )
    args = parser.parse_args()
        
    downloader = ImageDownloader(
        url=args.url,
        file_types=args.file_types,
        output_dir=args.output_dir
    )
    downloader.download_all_images()
    
"""Example usage:
python scrape_images.py "https://echl.com/standings" --output-dir="images/echl_logos"
"""