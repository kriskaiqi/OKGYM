const https = require('https');
const fs = require('fs');
const path = require('path');

// Latest stable version that works with our implementation
const MEDIAPIPE_VERSION = '0.5.1675469404';

// Complete list of required files
const FILES_TO_DOWNLOAD = [
  {
    name: 'pose_solution_packed_assets.data',
    minSize: 2 * 1024 * 1024  // Should be at least 2MB
  },
  {
    name: 'pose_solution_packed_assets_loader.js',
    minSize: 5 * 1024  // Should be at least 5KB
  },
  {
    name: 'pose_solution_simd_wasm_bin.js',
    minSize: 200 * 1024  // Should be at least 200KB
  },
  {
    name: 'pose_solution_simd_wasm_bin.wasm',
    minSize: 2 * 1024 * 1024  // Should be at least 2MB
  },
  {
    name: 'pose_landmark_full.tflite',
    minSize: 6 * 1024 * 1024  // Actually about 6.4MB
  },
  {
    name: 'pose_web.binarypb',
    minSize: 1000  // Actually about 1007 bytes
  }
];

// Get absolute paths
const ROOT_DIR = process.cwd();
console.log('Current directory:', ROOT_DIR);

const MEDIAPIPE_DIR = path.join(ROOT_DIR, 'frontend', 'public', 'mediapipe');
console.log('Target directory:', MEDIAPIPE_DIR);

// Create mediapipe directory if it doesn't exist
if (!fs.existsSync(MEDIAPIPE_DIR)) {
  fs.mkdirSync(MEDIAPIPE_DIR, { recursive: true });
}

// Verify file size and content
function verifyFile(filePath, minSize) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size < minSize) {
      console.error(`File ${filePath} is too small (${stats.size} bytes). Expected at least ${minSize} bytes.`);
      return false;
    }
    // Try reading the first few bytes to ensure it's not corrupted
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    return true;
  } catch (error) {
    console.error(`Error verifying file ${filePath}:`, error);
    return false;
  }
}

// Download files sequentially to avoid overwhelming the connection
async function downloadFile(fileInfo) {
  const { name, minSize } = fileInfo;
  return new Promise((resolve, reject) => {
    const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${MEDIAPIPE_VERSION}/${name}`;
    const filePath = path.join(MEDIAPIPE_DIR, name);
    
    console.log(`Downloading ${name} from ${url}`);
    console.log(`Saving to ${filePath}`);

    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            if (verifyFile(filePath, minSize)) {
              console.log(`Successfully downloaded and verified: ${name}`);
              resolve();
            } else {
              fs.unlinkSync(filePath);
              reject(new Error(`File verification failed for ${name}`));
            }
          });
        });

        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {});
          console.error(`Error writing file ${name}:`, err);
          reject(err);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        const newUrl = response.headers.location;
        console.log(`Redirecting to ${newUrl}`);
        https.get(newUrl, (redirectResponse) => {
          if (redirectResponse.statusCode === 200) {
            const fileStream = fs.createWriteStream(filePath);
            redirectResponse.pipe(fileStream);

            fileStream.on('finish', () => {
              fileStream.close(() => {
                if (verifyFile(filePath, minSize)) {
                  console.log(`Successfully downloaded and verified: ${name}`);
                  resolve();
                } else {
                  fs.unlinkSync(filePath);
                  reject(new Error(`File verification failed for ${name}`));
                }
              });
            });
          } else {
            reject(new Error(`HTTP Status ${redirectResponse.statusCode} after redirect`));
          }
        }).on('error', reject);
      } else {
        console.error(`Failed to download ${name}: ${response.statusCode}`);
        reject(new Error(`HTTP Status ${response.statusCode}`));
      }
    });

    request.on('error', (err) => {
      console.error(`Network error downloading ${name}:`, err.message);
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${name}`));
    });
  });
}

async function downloadAllFiles() {
  console.log('Starting downloads...');
  
  let successCount = 0;
  const failedFiles = [];

  for (const fileInfo of FILES_TO_DOWNLOAD) {
    try {
      await downloadFile(fileInfo);
      successCount++;
    } catch (error) {
      console.error(`Failed to download ${fileInfo.name}:`, error);
      failedFiles.push(fileInfo.name);
    }
  }

  // Final verification
  console.log('\nVerifying all files...');
  const missingFiles = [];
  const invalidFiles = [];

  for (const fileInfo of FILES_TO_DOWNLOAD) {
    const filePath = path.join(MEDIAPIPE_DIR, fileInfo.name);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(fileInfo.name);
    } else if (!verifyFile(filePath, fileInfo.minSize)) {
      invalidFiles.push(fileInfo.name);
    }
  }

  if (missingFiles.length > 0) {
    console.error('\nMissing files:', missingFiles.join(', '));
  }
  if (invalidFiles.length > 0) {
    console.error('\nInvalid files:', invalidFiles.join(', '));
  }

  if (successCount === FILES_TO_DOWNLOAD.length && missingFiles.length === 0 && invalidFiles.length === 0) {
    console.log('\nAll files downloaded and verified successfully!');
  } else {
    console.error(`\nOnly ${successCount} of ${FILES_TO_DOWNLOAD.length} files downloaded successfully`);
    console.error('Failed files:', failedFiles.join(', '));
    process.exit(1);
  }
}

// Run the download
downloadAllFiles().catch(error => {
  console.error('Download failed:', error);
  process.exit(1);
}); 