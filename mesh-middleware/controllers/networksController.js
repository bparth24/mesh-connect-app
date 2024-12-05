const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

/**
 * Fetches mesh networks from the MESH API and sends the response data as JSON.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 *
 * @throws {Error} - If there is an error fetching the mesh networks, it logs the error and sends a 500 status with an error message.
 */
const getMeshNetworks = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/networks`, { headers: MESH_HEADERS });
        console.log('getMeshNetworks -> api response', response.data);

        // for testing & debugging purposes
        // const ethereum_network_id = filterMeshNetworks(response.data, 'Ethereum');
        // console.log({ "networkId": ethereum_network_id });
        // res.json({"networkId": ethereum_network_id});

        res.json(response.data);
    } catch (error) {
        console.error('getMeshNetworks -> Error fetching mesh networks:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Networks' });
    }
};

module.exports = { getMeshNetworks };