import os
import requests
import time
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='image_update.log'
)
logger = logging.getLogger('image_updater')

# Set your Pexels API key here
PEXELS_API_KEY = "4AGAx1kuafX7F8vKsEy6jaJRQ3x2ftGfwFUPuYIUgREWETvNXWSgqcE3"  # Get your API key from https://www.pexels.com/api/

# Directories containing placeholder images
IMAGE_DIRS = [
    {
        "path": Path("C:/Users/DELL/Desktop/OKGYM/backend/public/images/equipment"),
        "search_prefix": "gym equipment ",
        "orientation": "landscape"
    },
    {
        "path": Path("C:/Users/DELL/Desktop/OKGYM/backend/public/static/exercises/images"),
        "search_prefix": "exercise ",
        "orientation": "portrait"
    },
    {
        "path": Path("C:/Users/DELL/Desktop/OKGYM/backend/public/static/workouts/images"),
        "search_prefix": "workout ",
        "orientation": "landscape"
    }
]

def get_pexels_image(search_term, api_key, orientation="landscape", per_page=5):
    """Search Pexels for an image and return the URL of the best result."""
    headers = {
        "Authorization": api_key
    }
    
    url = f"https://api.pexels.com/v1/search?query={search_term}&per_page={per_page}&orientation={orientation}"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("total_results", 0) > 0 and len(data.get("photos", [])) > 0:
            # Try to find images with people if it's a workout/exercise
            if "exercise" in search_term or "workout" in search_term:
                for photo in data["photos"]:
                    # Return the first medium-sized image
                    return photo["src"]["large"]
            
            # Otherwise, just return the first result
            return data["photos"][0]["src"]["large"]
        else:
            logger.warning(f"No results found for '{search_term}'")
            return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching image from Pexels: {e}")
        return None
    except (KeyError, IndexError) as e:
        logger.error(f"Error parsing Pexels response: {e}")
        return None

def download_and_save_image(url, filepath):
    """Download an image from a URL and save it to the specified filepath."""
    try:
        print(f"  🔽 Downloading image from {url}")
        logger.info(f"Downloading image from {url}")
        
        response = requests.get(url, stream=True, timeout=15)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            downloaded = 0
            total_size = int(response.headers.get('content-length', 0))
            
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"  📊 Download progress: {percent:.1f}%", end='\r')
        
        print(f"  ✅ Successfully saved image to {filepath}")
        logger.info(f"Successfully saved image to {filepath}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Failed to download image from {url}: {e}")
        logger.error(f"Failed to download image from {url}: {e}")
        return False
    except IOError as e:
        print(f"  ❌ Failed to save image to {filepath}: {e}")
        logger.error(f"Failed to save image to {filepath}: {e}")
        return False

def format_search_term(filename, prefix=""):
    """Format a filename into a search term."""
    # Remove file extension, replace hyphens with spaces
    search_term = os.path.splitext(filename)[0].replace('-', ' ').replace('&', 'and').replace("'", '')
    
    # Clean up specific tokens for better results
    search_term = search_term.replace('_', ' ')
    
    # Add the prefix
    search_term = prefix + search_term
    
    return search_term

def main():
    # Ensure the API key is set
    if not PEXELS_API_KEY or PEXELS_API_KEY == "YOUR_PEXELS_API_KEY":
        print("Please set your Pexels API key in the script.")
        logger.error("Pexels API key not set")
        return
    
    total_processed = 0
    total_updated = 0
    
    for dir_info in IMAGE_DIRS:
        dir_path = dir_info["path"]
        search_prefix = dir_info["search_prefix"]
        orientation = dir_info.get("orientation", "landscape")
        
        print(f"\n📁 Processing directory: {dir_path}")
        logger.info(f"Processing directory: {dir_path}")
        
        # Ensure the directory exists
        if not os.path.exists(dir_path):
            print(f"❌ Directory {dir_path} does not exist. Creating it...")
            logger.warning(f"Directory {dir_path} does not exist. Creating it...")
            try:
                os.makedirs(dir_path, exist_ok=True)
            except OSError as e:
                print(f"❌ Failed to create directory {dir_path}: {e}")
                logger.error(f"Failed to create directory {dir_path}: {e}")
                continue
        
        # Get all image files in the directory
        image_files = [f for f in os.listdir(dir_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        if not image_files:
            print(f"❌ No image files found in {dir_path}")
            logger.warning(f"No image files found in {dir_path}")
            continue
        
        print(f"📊 Found {len(image_files)} image files")
        logger.info(f"Found {len(image_files)} image files in {dir_path}")
        
        for image_file in image_files:
            total_processed += 1
            print(f"\n🔄 Processing {image_file}...")
            logger.info(f"Processing {image_file}")
            filepath = os.path.join(dir_path, image_file)
            
            # Check if file size is very small (likely a placeholder)
            try:
                file_size = os.path.getsize(filepath)
                if file_size > 50000:  # Skip files larger than 50KB (likely already have good images)
                    print(f"  ⏩ Skipping {image_file} - already has content ({file_size/1024:.1f}KB)")
                    logger.info(f"Skipping {image_file} - already has content ({file_size/1024:.1f}KB)")
                    continue
            except OSError as e:
                # If we can't get the file size, log it and still try to update it
                print(f"  ⚠️ Couldn't get file size: {e}")
                logger.warning(f"Couldn't get file size for {image_file}: {e}")
            
            # Format the search term with prefix
            search_term = format_search_term(image_file, search_prefix)
            print(f"  🔎 Searching for: '{search_term}'")
            logger.info(f"Searching for: '{search_term}'")
            
            # Search for image on Pexels
            image_url = get_pexels_image(search_term, PEXELS_API_KEY, orientation)
            
            if image_url:
                # Download and save the image
                if download_and_save_image(image_url, filepath):
                    total_updated += 1
                    # Respect Pexels API rate limits (1 request per second)
                    time.sleep(1)
            else:
                print(f"  ❌ No image found for '{search_term}'")
                logger.warning(f"No image found for '{search_term}'")
    
    print(f"\n📊 Summary: Processed {total_processed} images, updated {total_updated} images")
    logger.info(f"Summary: Processed {total_processed} images, updated {total_updated} images")

if __name__ == "__main__":
    main() 