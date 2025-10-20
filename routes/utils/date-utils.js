var format = require('date-format');

/**
 * Format a date using the specified format string
 * @param {Date} date - The date to format
 * @param {string} formatString - The format string (default: 'yyyy-MM-dd')
 * @returns {string} Formatted date string or empty string if date is null
 */
function formatDate(date, formatString = 'yyyy-MM-dd') {
    if (date == null) return "";
    return format(formatString, date);
}

/**
 * Format a date with time using the default format 'yyyy-MM-dd hh:mm'
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string or empty string if date is null
 */
function formatDateTime(date) {
    return formatDate(date, 'yyyy-MM-dd hh:mm');
}

/**
 * Format a date for display purposes using 'MM/dd/yyyy' format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string or empty string if date is null
 */
function formatDisplayDate(date) {
    return formatDate(date, 'MM/dd/yyyy');
}

module.exports = {
    formatDate,
    formatDateTime,
    formatDisplayDate
};
