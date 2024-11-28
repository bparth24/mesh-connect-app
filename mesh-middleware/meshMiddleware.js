const axios = require('axios');
require('dotenv').config();

const MESH_SANDBOX_API_BASE_URL = process.env.MESH_SANDBOX_API_BASE_URL;
const MESH_SANDBOX_API_KEY = process.env.MESH_SANDBOX_API_KEY;
const MESH_CLIENT_ID = process.env.MESH_CLIENT_ID;
const MESH_HEADERS = {
    'X-Client-Secret': MESH_SANDBOX_API_KEY,
    'X-Client-Id': MESH_CLIENT_ID,
    'Content-Type': 'application/json'
};

const getLinkToken = async (req, res) => {
    // const { UserId, IntegrationId, ReqrestrictMultipleAccounts, TransferOptions, AmountInFiat } = req.body;
    const { UserId, IntegrationId } = req.body;

    if (!UserId) {
        return res.status(400).json({ error: 'UserId is required' });
    }

    const bodyContent = JSON.stringify({
        userId: UserId,
        integrationId: IntegrationId
    });

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/linktoken`, bodyContent, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching link token:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Link Token' });
        
    }
};

const getMeshHealthStatus = async (req, res) => {
    //console.log(`${MESH_SANDBOX_API_BASE_URL}/v1/status`);
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/status`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching mesh health status:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Health Status' });
    }
};

const getMeshIntegrations = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/integrations`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching integrations:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Integrations' });
    }
};

// Managed Transfers Related API Endpoints

const getMeshNetworks = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/networks`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching mesh networks:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Networks' });
    }
};

const getMeshTransferIntegrations = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/integrations`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching mesh transfer integrations:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Mesh Transfer Integrations' });
    }
};

// Portfolios Related API Endpoints
// Obtain assets from the connected investment account. Performs realtime API call to the underlying integration.
const getHoldings = async (req, res) => {
    const { authToken, type } = req.body;

    if (!authToken || !type) {
        return res.status(400).json({ error: 'authToken and type are required' });
    }

    const bodyContent = JSON.stringify({
        authToken: authToken,
        type: type
    });

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/holdings/get`, bodyContent, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching portfolio holdings:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Portfolio Holdings' });

    }

};

module.exports = { getLinkToken, getMeshHealthStatus, getMeshIntegrations, getMeshNetworks, getMeshTransferIntegrations, getHoldings };