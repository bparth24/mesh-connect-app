const axios = require('axios');
require('dotenv').config();
const { filterMeshIntegrations, filterMeshNetworks } = require('./utils');

const MESH_SANDBOX_API_BASE_URL = process.env.MESH_SANDBOX_API_BASE_URL;
const MESH_SANDBOX_API_KEY = process.env.MESH_SANDBOX_API_KEY;
const MESH_CLIENT_ID = process.env.MESH_CLIENT_ID;
const MESH_COINBASE_ACCESS_TOKEN = process.env.MESH_COINBASE_ACCESS_TOKEN;
const MESH_HEADERS = {
    'X-Client-Secret': MESH_SANDBOX_API_KEY,
    'X-Client-Id': MESH_CLIENT_ID,
    'Content-Type': 'application/json'
};

// Link Token to Connect Coinbase Account
const getLinkToken = async (req, res) => {
    const { userId, transferOptions, integrationId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }
    console.log({ "userId": userId, "transferOptions": transferOptions, "integrationId": integrationId });

    const bodyContent = JSON.stringify({
        userId: userId,
        transferOptions: transferOptions,
        integrationId: integrationId
    });

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/linktoken`, bodyContent, { headers: MESH_HEADERS });
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching link token:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Link Token' });
        
    }
};

// Link Token to Pay with Coinbase Account

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
        // console.log(response.data);
        // TODO: for now hardwire the integration name to 'Coinbase' -- update this to be dynamic from the frontend
        // const coinbase_integration_id = filterMeshIntegrations(response.data, 'Coinbase');
        // console.log({ "integrationId": coinbase_integration_id });

        // res.json({"integrationId": coinbase_integration_id});
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
        console.log(response.data);

        // TODO: for now hardwire the network name to 'Ethereum' -- update this to be dynamic from the frontend
        const ethereum_network_id = filterMeshNetworks(response.data, 'Ethereum');
        console.log({ "networkId": ethereum_network_id });

        res.json({"networkId": ethereum_network_id});
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

const previewTransfer = async (req, res) => {
    const { fromAuthToken, fromType, toAddresses, amountInFiat, fiatCurrency,  } = req.body;

    if (!fromAuthToken || !fromType ) {
        return res.status(400).json({ error: 'fromAuthToken and fromType fields are required' });
    }

    const bodyContent = JSON.stringify({
        fromAuthToken: fromAuthToken,
        fromType: fromType,
        toAddresses: toAddresses,
        amountInFiat: amountInFiat,
        fiatCurrency: fiatCurrency
    });

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/preview`, bodyContent, { headers: MESH_HEADERS });
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching link token:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Link Token' });

    }
};

// Portfolios Related API Endpoints
// Obtain assets from the connected investment account. Performs realtime API call to the underlying integration.
const getHoldings = async (req, res) => {
    const { authToken, type } = req.body;

    console.log({ "authToken": authToken, "type": type });

    if (!authToken || !type) {
        return res.status(400).json({ error: 'authToken and type are required' });
    }
    // TODO: Save the accessToken in database and then use it to fetch the holdings
    const bodyContent = JSON.stringify({
        authToken: authToken,
        type: type
    });

    // console.log(bodyContent);

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/holdings/get`, bodyContent, { headers: MESH_HEADERS });
        console.log(JSON.stringify(response.data));
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching portfolio holdings:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Portfolio Holdings' });

    }

};

// Get Aggregated Portfolio
const getAggregatedPortfolio = async (req, res) => {
    const { UserId } = req.query;

    if (!UserId){
        return res.status(400).json({ error: 'UserId is required' });
    }

    try {
        const response = await axios.get(`${MESH_SANDBOX_API_BASE_URL}/v1/holdings/portfolio/`, { headers: MESH_HEADERS, params: {UserId} });
        console.log(JSON.stringify(response.data));
        res.json(response.data);
    } catch (error) {
        console.log('Error fetching aggregated portfolio:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Aggregated Portfolio' });
    }
};


module.exports = { getLinkToken, getMeshHealthStatus, getMeshIntegrations, getMeshNetworks, getMeshTransferIntegrations, getHoldings, getAggregatedPortfolio, previewTransfer };