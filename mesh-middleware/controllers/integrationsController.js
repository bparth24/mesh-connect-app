const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

/**
 * Fetches mesh integrations from the MESH API and returns the response data.
 * 
 * @async
 * @function getMeshIntegrations
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if fetching integrations fails.
 */
const getMeshIntegrations = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/integrations`, { headers: MESH_HEADERS });
        // console.log(response.data);
        // TODO: for now hardwire the integration name to 'Coinbase' -- update this to be dynamic from the frontend
        // const coinbase_integration_id = filterMeshIntegrations(response.data, 'Coinbase');
        // console.log({ "integrationId": coinbase_integration_id });

        // res.json({"integrationId": coinbase_integration_id});
        res.json(response.data);
    } catch (error) {
        console.error('getMeshIntegrations -> Error fetching integrations:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Integrations' });
    }
};

module.exports = { getMeshIntegrations };