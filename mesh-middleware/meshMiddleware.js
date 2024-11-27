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
    const { UserId, IntegrationId, ReqrestrictMultipleAccounts, TransferOptions, AmountInFiat } = req.body;

    if (!UserId) {
        return res.status(400).json({ error: 'UserId is required' });
    }

    const data = {
        userId: UserId,
        integrationId: IntegrationId,
        reqrestrictMultipleAccounts: ReqrestrictMultipleAccounts,
        transferOptions: TransferOptions,
        amountInFiat: AmountInFiat
    };

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/linktoken`, data, { MESH_HEADERS });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching link token:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getMeshHealthStatus = async (req, res) => {
    //console.log(`${MESH_SANDBOX_API_BASE_URL}/v1/status`);
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/status`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching mesh health status:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getMeshIntegrations = async (req, res) => {
    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/integrations`, { headers: MESH_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching integrations:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {  getLinkToken, getMeshHealthStatus, getMeshIntegrations };