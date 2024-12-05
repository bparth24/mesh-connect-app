const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

/**
 * Asynchronously fetches the health status of the mesh network and sends the response back to the client.
 */
const getMeshHealthStatus = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/status`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching mesh health status:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Health Status' });
    }
};

module.exports = {
    getMeshHealthStatus
};