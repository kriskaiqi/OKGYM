import os
import requests
import time
from pathlib import Path
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='video_update.log'
)
logger = logging.getLogger('video_updater')

# Set your Pexels API key here
PEXELS_API_KEY = "4AGAx1kuafX7F8vKsEy6jaJRQ3x2ftGfwFUPuYIUgREWETvNXWSgqcE3"  # Get your API key from https://www.pexels.com/api/

# Quality options (in order of preference)
QUALITY_OPTIONS = ["hd", "sd", "mobile"]

# Directories containing placeholder videos
VIDEO_DIRS = [
    {
        "path": Path("C:/Users/DELL/Desktop/OKGYM/backend/public/static/videos/equipment"),
        "search_prefix": "fitness "
    },
]

def get_pexels_video(search_term, api_key, per_page=5):
    """Search Pexels for a video and return the URL of the best result."""
    headers = {
        "Authorization": api_key
    }
    
    url = f"https://api.pexels.com/videos/search?query={search_term}&per_page={per_page}"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("total_results", 0) > 0 and len(data.get("videos", [])) > 0:
            # Get the first video result
            video = data["videos"][0]
            
            # Get video files
            video_files = video.get("video_files", [])
            
            if not video_files:
                logger.warning(f"No video files found for '{search_term}'")
                return None
            
            # First try to find a file with width between 640-1280px for reasonable file size
            for quality in QUALITY_OPTIONS:
                for file in video_files:
                    # Don't get 4K videos (too large)
                    if file.get("width", 0) <= 1280 and file.get("width", 0) >= 640 and file.get("quality") == quality:
                        return file["link"]
            
            # Fallback: just get the first file
            return video_files[0]["link"]
        else:
            logger.warning(f"No video results found for '{search_term}'")
            return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching video from Pexels: {e}")
        return None
    except (KeyError, IndexError) as e:
        logger.error(f"Error parsing Pexels response: {e}")
        return None

def download_and_save_video(url, filepath):
    """Download a video from a URL and save it to the specified filepath."""
    try:
        print(f"  🔽 Downloading video from {url}")
        logger.info(f"Downloading video from {url}")
        
        # First, check video size before downloading
        response = requests.head(url, timeout=10)
        content_length = int(response.headers.get('content-length', 0))
        content_mb = content_length / (1024 * 1024)
        
        # Warn if file is very large
        if content_mb > 20:
            print(f"  ⚠️ Warning: Video is {content_mb:.1f}MB. This may take a while.")
            logger.warning(f"Large video detected: {content_mb:.1f}MB")
        
        # Now download the file
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=1024*1024):  # 1MB chunks
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    percent = (downloaded / content_length) * 100 if content_length > 0 else 0
                    print(f"  📊 Download progress: {percent:.1f}% ({downloaded/(1024*1024):.1f}MB of {content_mb:.1f}MB)", end='\r')
            
            print("\n  ✅ Successfully saved video to {filepath}")
            logger.info(f"Successfully saved video to {filepath}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Failed to download video from {url}: {e}")
        logger.error(f"Failed to download video from {url}: {e}")
        return False
    except IOError as e:
        print(f"  ❌ Failed to save video to {filepath}: {e}")
        logger.error(f"Failed to save video to {filepath}: {e}")
        return False

def format_search_term(filename, prefix=""):
    """Format a filename into a search term."""
    # Remove file extension, replace hyphens with spaces
    search_term = os.path.splitext(filename)[0].replace('-', ' ').replace('&', 'and').replace("'", '')
    
    # Clean up specific tokens for better results
    search_term = search_term.replace('_', ' ')
    
    # Add fitness-related terms for better results
    if "exercise" not in search_term and "workout" not in search_term and prefix == "":
        search_term = "fitness " + search_term
    
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
    
    for dir_info in VIDEO_DIRS:
        dir_path = dir_info["path"]
        search_prefix = dir_info["search_prefix"]
        
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
        
        # Get all video files in the directory
        video_files = [f for f in os.listdir(dir_path) if f.lower().endswith(('.mp4', '.webm', '.mov', '.avi'))]
        
        if not video_files:
            print(f"❌ No video files found in {dir_path}")
            logger.warning(f"No video files found in {dir_path}")
            
            # Optional: Create a sample video file
            if input(f"Would you like to create a sample video file in {dir_path}? (y/n): ").lower() == 'y':
                sample_filename = "sample-workout.mp4"
                with open(os.path.join(dir_path, sample_filename), 'wb') as f:
                    f.write(b'placeholder')  # Write a placeholder byte
                video_files = [sample_filename]
                print(f"Created sample file: {sample_filename}")
                logger.info(f"Created sample file: {sample_filename}")
            else:
                continue
        
        print(f"📊 Found {len(video_files)} video files")
        logger.info(f"Found {len(video_files)} video files in {dir_path}")
        
        for video_file in video_files:
            total_processed += 1
            print(f"\n🔄 Processing {video_file}...")
            logger.info(f"Processing {video_file}")
            filepath = os.path.join(dir_path, video_file)
            
            # Check if file size is very small (likely a placeholder)
            try:
                file_size = os.path.getsize(filepath)
                if file_size > 1000000:  # Skip files larger than 1MB (likely already have good videos)
                    print(f"  ⏩ Skipping {video_file} - already has content ({file_size/1024/1024:.1f}MB)")
                    logger.info(f"Skipping {video_file} - already has content ({file_size/1024/1024:.1f}MB)")
                    continue
            except OSError as e:
                # If we can't get the file size, log it and still try to update it
                print(f"  ⚠️ Couldn't get file size: {e}")
                logger.warning(f"Couldn't get file size for {video_file}: {e}")
            
            # Format the search term with prefix
            search_term = format_search_term(video_file, search_prefix)
            print(f"  🔎 Searching for: '{search_term}'")
            logger.info(f"Searching for: '{search_term}'")
            
            # Search for video on Pexels
            video_url = get_pexels_video(search_term, PEXELS_API_KEY)
            
            if video_url:
                # Download and save the video
                if download_and_save_video(video_url, filepath):
                    total_updated += 1
                    # Respect Pexels API rate limits (1 request per second)
                    time.sleep(1)
            else:
                print(f"  ❌ No video found for '{search_term}'")
                logger.warning(f"No video found for '{search_term}'")
    
    print(f"\n📊 Summary: Processed {total_processed} videos, updated {total_updated} videos")
    logger.info(f"Summary: Processed {total_processed} videos, updated {total_updated} videos")

if __name__ == "__main__":
    main() 