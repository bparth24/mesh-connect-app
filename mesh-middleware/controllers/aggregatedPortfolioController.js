const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

/**
 * Fetches the aggregated portfolio for a given user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.UserId - The ID of the user whose portfolio is to be fetched.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 *
 * @throws {Error} - Throws an error if the UserId is not provided or if there is an issue fetching the portfolio.
 */
const getAggregatedPortfolio = async (req, res) => {
    const { UserId } = req.query;

    if (!UserId) {
        return res.status(400).json({ error: 'UserId is required' });
    }

    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/holdings/portfolio/`, { headers: MESH_HEADERS, params: { UserId } });
        console.log(JSON.stringify(response.data));
        res.json(response.data);
    } catch (error) {
        console.log('Error fetching aggregated portfolio:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Aggregated Portfolio' });
    }
};

module.exports = { getAggregatedPortfolio };