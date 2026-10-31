/**
 * Format a number as Indian Rupee currency.
 */
export const formatPrice = (amount, listingType = 'SALE') => {
  if (!amount && amount !== 0) return 'Price on Request';

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  if (listingType === 'RENT') return `${formatted}/mo`;
  return formatted;
};

/**
 * Format a large number with K/L/Cr suffix.
 */
export const formatPriceShort = (amount) => {
  if (!amount) return '0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

/**
 * Format date to readable string.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date to short string.
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time to 12-hour format.
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Get relative time (e.g., "2 hours ago").
 */
export const timeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDateShort(dateString);
};

/**
 * Get the primary image URL from property images array.
 */
export const getPrimaryImage = (images, fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400') => {
  if (!images || images.length === 0) return fallback;
  const primary = images.find((img) => img.isPrimary);
  return primary ? primary.url : images[0].url;
};

/**
 * Calculate commission amount (2.5%).
 */
export const calculateCommission = (amount) => {
  return (amount * 0.025).toFixed(0);
};

/**
 * Truncate text to given length.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
