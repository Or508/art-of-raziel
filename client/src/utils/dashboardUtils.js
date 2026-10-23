// Dashboard Utility Functions - Separated to reduce AdminDashboard load

/**
 * Calculate peak hours from visitor traffic data
 * @param {Array} trafficData - Array of {hour, visitors}
 * @param {number} topN - Number of peak hours to return (default: 3)
 * @returns {Array} Array of peak hour strings
 */
export const calculatePeakHours = (trafficData, topN = 3) => {
  if (!trafficData || trafficData.length === 0) return [];
  
  return [...trafficData]
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, topN)
    .map(item => item.hour);
};

/**
 * Format currency value
 * @param {number} value - Currency value
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = '$') => {
  return `${currency}${value.toLocaleString()}`;
};

/**
 * Format percentage value
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};
