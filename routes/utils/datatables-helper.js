/**
 * DataTables Helper Utility
 * Provides common functionality for DataTables server-side processing
 */

/**
 * Parse DataTables request parameters from Express request
 * @param {Object} req - Express request object
 * @returns {Object} Parsed DataTables parameters
 */
function parseDataTablesRequest(req) {
    return {
        draw: req.query.draw,
        start: parseInt(req.query.start) || 0,
        length: parseInt(req.query.length) || 10,
        search: req.query.search ? req.query.search.value || '' : '',
        order: req.query.order || null
    };
}

/**
 * Build sort clause from DataTables order parameters
 * @param {Object} orderParams - DataTables order parameters
 * @param {Object} columnMap - Map of column indices to field names
 * @param {Object} defaultSort - Default sort clause
 * @returns {Object} MongoDB sort clause
 */
function buildSortClause(orderParams, columnMap, defaultSort = { lastUpdated: -1 }) {
    if (!orderParams || !orderParams[0] || !columnMap) {
        return defaultSort;
    }
    
    const sortColumn = orderParams[0].column;
    const sortDirection = orderParams[0].dir === 'asc' ? 1 : -1;
    const fieldName = columnMap[sortColumn];
    
    if (fieldName) {
        return { [fieldName]: sortDirection };
    }
    
    return defaultSort;
}

/**
 * Create initial DataTables response structure
 * @param {string} draw - Draw parameter from request
 * @returns {Object} Initial response structure
 */
function createDataTablesResponse(draw) {
    return {
        "draw": draw,
        "recordsTotal": 0,
        "recordsFiltered": 0,
        "data": []
    };
}

/**
 * Handle DataTables query with search and pagination
 * @param {Object} Model - Mongoose model to query
 * @param {Object} params - DataTables parameters from parseDataTablesRequest
 * @param {Object} options - Query options
 * @param {Object} options.baseQuery - Base MongoDB query object
 * @param {string} options.searchField - Field to search in (default: 'search')
 * @param {Object} options.sortClause - MongoDB sort object (default: {lastUpdated: -1})
 * @param {Object} options.selectFields - MongoDB select object (optional)
 * @param {Function} options.transformRow - Function to transform each row for DataTables
 * @returns {Promise<Object>} DataTables response object
 */
async function handleDataTablesQuery(Model, params, options = {}) {
    const {
        baseQuery = {},
        searchField = 'search',
        sortClause = { lastUpdated: -1 },
        selectFields = null,
        transformRow = (item) => item
    } = options;

    const response = createDataTablesResponse(params.draw);

    try {
        // Build search query
        const searchQuery = { ...baseQuery };
        if (params.search && params.search.trim() !== '') {
            searchQuery[searchField] = new RegExp(params.search, 'i');
        }

        // Execute main query with pagination
        let query = Model.find(searchQuery);
        
        if (selectFields) {
            query = query.select(selectFields);
        }
        
        const items = await query
            .sort(sortClause)
            .skip(params.start)
            .limit(params.length)
            .exec();

        // Transform rows for DataTables
        response.data = items.map(transformRow);

        // Get total count (without search filter)
        response.recordsTotal = await Model.countDocuments(baseQuery);

        // Get filtered count (with search filter)
        if (params.search && params.search.trim() !== '') {
            response.recordsFiltered = await Model.countDocuments(searchQuery);
        } else {
            response.recordsFiltered = response.recordsTotal;
        }

        return response;

    } catch (error) {
        console.error('DataTables query error:', error);
        throw error;
    }
}

/**
 * Handle DataTables query with estimated document count (faster for large collections)
 * @param {Object} Model - Mongoose model to query
 * @param {Object} params - DataTables parameters from parseDataTablesRequest
 * @param {Object} options - Query options (same as handleDataTablesQuery)
 * @returns {Promise<Object>} DataTables response object
 */
async function handleDataTablesQueryWithEstimatedCount(Model, params, options = {}) {
    const {
        baseQuery = {},
        searchField = 'search',
        sortClause = { lastUpdated: -1 },
        selectFields = null,
        transformRow = (item) => item
    } = options;

    const response = createDataTablesResponse(params.draw);

    try {
        // Build search query
        const searchQuery = { ...baseQuery };
        if (params.search && params.search.trim() !== '') {
            searchQuery[searchField] = new RegExp(params.search, 'i');
        }

        // Execute main query with pagination
        let query = Model.find(searchQuery);
        
        if (selectFields) {
            query = query.select(selectFields);
        }
        
        const items = await query
            .sort(sortClause)
            .skip(params.start)
            .limit(params.length)
            .exec();

        // Transform rows for DataTables
        response.data = items.map(transformRow);

        // Get estimated total count (faster but less accurate)
        response.recordsTotal = await Model.estimatedDocumentCount();

        // Get filtered count (with search filter)
        if (params.search && params.search.trim() !== '') {
            response.recordsFiltered = await Model.countDocuments(searchQuery);
        } else {
            response.recordsFiltered = response.recordsTotal;
        }

        return response;

    } catch (error) {
        console.error('DataTables query error:', error);
        throw error;
    }
}

/**
 * Send DataTables response with proper error handling
 * @param {Object} res - Express response object
 * @param {Promise} queryPromise - Promise that resolves to DataTables response
 */
async function sendDataTablesResponse(res, queryPromise) {
    try {
        const response = await queryPromise;
        res.json(response);
    } catch (error) {
        console.error('DataTables response error:', error);
        res.status(500).json({
            error: 'Internal server error',
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        });
    }
}

module.exports = {
    parseDataTablesRequest,
    createDataTablesResponse,
    buildSortClause,
    handleDataTablesQuery,
    handleDataTablesQueryWithEstimatedCount,
    sendDataTablesResponse
};
