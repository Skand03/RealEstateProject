const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by public ID.
 * @param {string} publicId
 * @param {string} resourceType - 'image' | 'raw'
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
    throw error;
  }
};

/**
 * Upload a property image to Cloudinary with optimization.
 */
const uploadPropertyImage = async (buffer, originalName) => {
  return await uploadToCloudinary(buffer, 'haikyuuheights/properties', {
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload a verification document to Cloudinary.
 * Stored in a private folder.
 */
const uploadVerificationDocument = async (buffer, type) => {
  return await uploadToCloudinary(
    buffer,
    `haikyuuheights/verifications/${type}`,
    {
      resource_type: 'auto',
    }
  );
};

/**
 * Upload a user avatar to Cloudinary.
 */
const uploadAvatar = async (buffer) => {
  return await uploadToCloudinary(buffer, 'haikyuuheights/avatars', {
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
    ],
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadPropertyImage,
  uploadVerificationDocument,
  uploadAvatar,
};
