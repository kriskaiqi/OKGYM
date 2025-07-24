# Media Update Scripts

This directory contains scripts for updating media files (images and videos) in your OKGYM application.

## Prerequisites

- Python 3.6 or higher
- `requests` library: `pip install requests`
- A [Pexels API key](https://www.pexels.com/api/) (free)

## Scripts

### 1. Image Update Script (`update_images.py`)

This script updates image files by searching for and downloading relevant images from Pexels based on the filename.

#### Configuration:

- Set your Pexels API key in the script
- Adjust the `IMAGE_DIRS` list to include all directories containing images you want to update
- Set the desired `ORIENTATION` for each directory (landscape, portrait, or square)

#### Usage:

```bash
python update_images.py
```

The script will:
1. Search all configured directories for image files
2. For each image file, search Pexels using the filename as a query
3. Download and replace the image file with the best matching result
4. Log the process and results

### 2. Video Update Script (`update_videos.py`)

This script updates video files by searching for and downloading relevant videos from Pexels based on the filename.

#### Configuration:

- Set your Pexels API key in the script
- Adjust the `VIDEO_DIRS` list to include all directories containing videos you want to update
- Set the desired `VIDEO_QUALITY` ("hd" or "sd")

#### Usage:

```bash
python update_videos.py
```

The script will:
1. Search all configured directories for video files (mp4, mov, avi, webm)
2. For each video file, search Pexels using the filename as a query
3. Download and replace the video file with the best matching result
4. Log the process and results

## Log Files

- Image updates are logged to `image_updates.log`
- Video updates are logged to `video_updates.log`

## Notes

- Files larger than 1MB are skipped (assumed to already have content)
- The scripts use rate limiting to respect the Pexels API limits
- Each directory can have a custom search prefix to improve search results

## Troubleshooting

If you encounter issues:

1. Check that your Pexels API key is valid
2. Ensure the directories exist and are accessible
3. Review the log files for specific error messages
4. Try adjusting the search prefix for better results 