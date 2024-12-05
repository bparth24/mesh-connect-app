const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

const getMeshNetworks = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/networks`, { headers: MESH_HEADERS });
        console.log(response.data);

        // for testing & debugging purposes
        // const ethereum_network_id = filterMeshNetworks(response.data, 'Ethereum');
        // console.log({ "networkId": ethereum_network_id });
        // res.json({"networkId": ethereum_network_id});

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching mesh networks:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Networks' });
    }
};

module.exports = { getMeshNetworks };