const axios = require('axios');
const sharp = require('sharp');

/**
 * Fetches an image from a URL, compresses it, and returns a base64 string
 * @param {string} url - The URL of the image to fetch
 * @param {Object} options - Compression options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.quality - JPEG quality (1-100)
 * @returns {Promise<string>} Base64 encoded image
 */
async function fetchAndCompressImage(url, options = { width: 150, quality: 80 }) {
  try {
    // Fetch image
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    // Process image with sharp
    const processedImageBuffer = await sharp(response.data)
      .resize(options.width, options.width, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: options.quality,
        progressive: true
      })
      .toBuffer();

    // Convert to base64
    return `data:image/jpeg;base64,${processedImageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

module.exports = {
  fetchAndCompressImage
};
