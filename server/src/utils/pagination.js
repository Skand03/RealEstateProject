/**
 * Extracts pagination parameters from query string.
 * Returns { page, limit, skip }
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 12));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds pagination metadata for API responses.
 */
const buildPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { getPagination, buildPaginationMeta };
