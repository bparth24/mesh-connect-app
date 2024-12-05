const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

/**
 * Fetches mesh transfer integrations from the MESH API and sends the response data as JSON.
 *
 * @async
 * @function getMeshTransferIntegrations
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends the response data as JSON or an error message with status 500.
 */
const getMeshTransferIntegrations = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/integrations`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('getMeshTransferIntegrations -> Error fetching mesh transfer integrations:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Transfer Integrations' });
    }
};

module.exports = { getMeshTransferIntegrations };