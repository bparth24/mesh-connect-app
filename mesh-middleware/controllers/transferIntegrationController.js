const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

const getMeshTransferIntegrations = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/integrations`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching mesh transfer integrations:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Transfer Integrations' });
    }
};

module.exports = { getMeshTransferIntegrations };