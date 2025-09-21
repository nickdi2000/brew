/**
 * Formats API responses consistently
 * @param {Object} options
 * @param {any} options.data - The data to send back
 * @param {string} options.message - Response message
 * @param {boolean} options.success - Whether the operation was successful
 * @returns {Object} Formatted response object
 */
const formatResponse = ({ data = null, message = '', success = true }) => {
  return {
    data,
    message,
    success
  };
};

/**
 * Formats error responses consistently
 * @param {string} message - Error message
 * @param {any} data - Optional error details
 * @returns {Object} Formatted error response
 */
const formatError = (message, data = null) => {
  return {
    data,
    message,
    success: false
  };
};

module.exports = {
  formatResponse,
  formatError
};
