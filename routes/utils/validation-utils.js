/**
 * Check if a string is empty or null
 * @param {string} str - The string to check
 * @returns {boolean} True if string is null, undefined, or has zero length
 */
function isEmpty(str) {
    return (!str || str.length === 0);
}

/**
 * Get a value or return empty string if null/undefined
 * @param {any} value - The value to check
 * @returns {string} The value as string or empty string if null/undefined
 */
function valueOrBlank(value) {
    if (value != null) return value;
    return "";
}

/**
 * Get last name or company name for display purposes
 * Used in customer displays where either lastName or company should be shown
 * @param {Object} customer - Customer object with lastName and company properties
 * @returns {string} Last name if available, otherwise company name, otherwise empty string
 */
function getLastOrCompany(customer) {
    var lastOrCompany = "";
    if (!isEmpty(customer.lastName)) {
        lastOrCompany = customer.lastName;
    } else if (!isEmpty(customer.company)) {
        lastOrCompany = customer.company;
    }
    return lastOrCompany;
}

/**
 * Overlay a field value - if canonical field is empty and field has value, use field value
 * Used in customer merging functionality
 * @param {string} canonicalField - The canonical field value
 * @param {string} field - The field value to potentially overlay
 * @returns {string} The canonical field or the field value if canonical is empty
 */
function overlayField(canonicalField, field) {
    if (isEmpty(canonicalField) && !isEmpty(field)) {
        canonicalField = field;
    }
    return canonicalField;
}

module.exports = {
    isEmpty,
    valueOrBlank,
    getLastOrCompany,
    overlayField
};
