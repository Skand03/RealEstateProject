const multer = require('multer');
const ApiError = require('../utils/ApiError');
const {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_PROPERTY_IMAGES,
} = require('../utils/constants');

// Use memory storage so files can be streamed to Cloudinary
const storage = multer.memoryStorage();

// Filter for property images
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Allowed types: jpeg, png, webp`
      ),
      false
    );
  }
};

// Filter for verification documents (accepts images + PDF)
const documentFileFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Allowed types: jpeg, png, pdf`
      ),
      false
    );
  }
};

// Multer for property images (max 10 images, 5MB each)
const uploadPropertyImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: MAX_PROPERTY_IMAGES,
  },
}).array('images', MAX_PROPERTY_IMAGES);

// Multer for single image (accepts either 'avatar' or 'image')
const uploadSingleImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

// Multer for verification documents (identity + ownership)
const uploadVerificationDocs = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
}).fields([
  { name: 'identityProof', maxCount: 1 },
  { name: 'ownershipProof', maxCount: 1 },
]);

// Wrapper to handle multer errors gracefully
const handleMulterError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'File size exceeds the allowed limit.'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(
          new ApiError(400, `Too many files. Maximum allowed: ${MAX_PROPERTY_IMAGES}.`)
        );
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    }
    if (err) return next(err);
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        req.file = req.files.avatar[0];
      } else if (req.files.image && req.files.image[0]) {
        req.file = req.files.image[0];
      }
    }
    next();
  });
};

module.exports = {
  uploadPropertyImages: handleMulterError(uploadPropertyImages),
  uploadSingleImage: handleMulterError(uploadSingleImage),
  uploadVerificationDocs: handleMulterError(uploadVerificationDocs),
};
