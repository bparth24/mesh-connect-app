const axios = require('axios');
require('dotenv').config();
const { filterMeshIntegrations, filterMeshNetworks } = require('./utils');
const { handleGetData, handleUpdateDoc } = require('./pouchdbService');

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
        // const ethereum_network_id = filterMeshNetworks(response.data, 'Ethereum');
        // console.log({ "networkId": ethereum_network_id });

        // res.json({"networkId": ethereum_network_id});
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

const previewTransfer = async (req, res) => {
    const { userId, fromType, networkId, symbol, toAddress, amountInFiat, fiatCurrency } = req.body;
    console.log('Preview Transfer Request - req.body received from user:', req.body); // Debugging purposes

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    if (!fromType || !networkId || !symbol || !toAddress || !amountInFiat || !fiatCurrency) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Fetch the access token from the database using the userId
        const dbResponse = await new Promise((resolve) => {
            const mockReq = { params: { id: userId } };
            const mockRes = {
                status: (statusCode) => ({
                    send: (data) => resolve({ statusCode, data }),
                    json: (data) => resolve({ statusCode, data })
                })
            };
            handleGetData(mockReq, mockRes);
        });

        if (!dbResponse || dbResponse.statusCode !== 200) {
            return res.status(dbResponse.statusCode).json(dbResponse.data);
        }

        const fromAuthToken = dbResponse.data.accessToken;

        if (!fromAuthToken) {
            return res.status(400).json({ error: 'fromAuthToken is required' });
        }

        const bodyContent = JSON.stringify({
            fromAuthToken: fromAuthToken,
            fromType: fromType,
            networkId: networkId,
            symbol: symbol,
            toAddress: toAddress,
            amountInFiat: amountInFiat,
            fiatCurrency: fiatCurrency
        });

        console.log('Preview Transfer Request - bodyContent for Mesh Preview Transfer:', bodyContent); // Debugging purposes

        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/preview`, bodyContent, { headers: MESH_HEADERS });
        console.log("Preview Transfer Response", response.data); // Debugging purposes

        // First test rest of the code and then uncomment this block
        // Check if the response contains the previewId
        if (!response.data || !response.data.content || !response.data.content.previewResult || !response.data.content.previewResult.previewId) {
            return res.status(500).json({ error: 'Invalid response from preview transfer API' });
        }

        // Extract previewId from the response
        const previewId = response.data.content.previewResult.previewId;

        // Update the document with the previewId
        const updateResponse = await new Promise((resolve) => {
            const mockReq = { body: { _id: userId, previewId: previewId, previewTransferResponse: response.data } };
            const mockRes = {
                status: (statusCode) => ({
                    send: (data) => resolve({ statusCode, data }),
                    json: (data) => resolve({ statusCode, data })
                })
            };
            handleUpdateDoc(mockReq, mockRes);
        });

        if (!updateResponse || updateResponse.statusCode !== 200) {
            return res.status(updateResponse.statusCode).json(updateResponse.data);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error previewing transfer:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Previewing Transfer' });
    }
};

// Execute Transfer
const executeTransfer = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        // Fetch the access token, type, and previewId from the database using the userId
        const dbResponse = await new Promise((resolve) => {
            const mockReq = { params: { id: userId } };
            const mockRes = {
                status: (statusCode) => ({
                    send: (data) => resolve({ statusCode, data }),
                    json: (data) => resolve({ statusCode, data })
                })
            };
            handleGetData(mockReq, mockRes);
        });

        if (!dbResponse || dbResponse.statusCode !== 200) {
            return res.status(dbResponse.statusCode).json(dbResponse.data);
        }

        const { accessToken, type, previewId } = dbResponse.data;

        if (!accessToken || !type || !previewId) {
            return res.status(400).json({ error: 'accessToken, type, and previewId are required' });
        }

        const bodyContent = JSON.stringify({
            fromAuthToken: accessToken,
            fromType: type,
            previewId: previewId,
            mfaCode: "123456" // Hardcoded MFA code for testing purposes
        });

        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/transfers/managed/execute`, bodyContent, { headers: MESH_HEADERS });

        // Check if the response contains the previewId
        if (!response.data || !response.data.content) {
            return res.status(500).json({ error: 'Invalid response from execute transfer API' });
        }

        // Update the document with the execute transfer response
        const updateResponse = await new Promise((resolve) => {
            const mockReq = { body: { _id: userId, executeTransferResponse: response.data } };
            const mockRes = {
                status: (statusCode) => ({
                    send: (data) => resolve({ statusCode, data }),
                    json: (data) => resolve({ statusCode, data })
                })
            };
            handleUpdateDoc(mockReq, mockRes);
        });

        if (!updateResponse || updateResponse.statusCode !== 200) {
            return res.status(updateResponse.statusCode).json(updateResponse.data);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error executing transfer:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Executing Transfer' });
    }
};

// Portfolios Related API Endpoints
// Obtain assets from the connected investment account. Performs realtime API call to the underlying integration.
const getHoldings = async (req, res) => {
    const { id } = req.body;
    console.log('Document ID:', id);

    if (!id) {
        return res.status(400).json({ error: 'Document id is required to pull the access token from database.' });
    }

    // Fetch the access token from the database using the document id
    const mockReq = { params: { id } };

    // Create a mock response object to capture the response from handleGetData
    const mockRes = {
        status: (statusCode) => ({
            send: (data) => ({ statusCode, data }),
            json: (data) => ({ statusCode, data })
        })
    };

    // Use a promise to wait for the response from handleGetData
    const dbResponse = await new Promise((resolve) => {
        const mockRes = {
            status: (statusCode) => ({
                send: (data) => resolve({ statusCode, data }),
                json: (data) => resolve({ statusCode, data })
            })
        };
        handleGetData(mockReq, mockRes);
    });

    console.log('DB Response:', dbResponse); // Debugging purposes

    if (!dbResponse || dbResponse.statusCode !== 200) {
        return res.status(dbResponse.statusCode).json(dbResponse.data);
    }

    const authToken = dbResponse.data.accessToken;
    const type = dbResponse.data.type;

    if (!authToken || !type) {
        return res.status(400).json({ error: 'authToken and type are required' });
    }

    const bodyContent = JSON.stringify({
        authToken: authToken,
        type: type
    });

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/holdings/get`, bodyContent, { headers: MESH_HEADERS });
        console.log('Get Holdings Response', JSON.stringify(response.data)); // Debugging purposes
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching portfolio holdings:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Portfolio Holdings' });

    }
};

// Get Aggregated Portfolio
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


module.exports = { getLinkToken, getMeshHealthStatus, getMeshIntegrations, getMeshNetworks, getMeshTransferIntegrations, getHoldings, getAggregatedPortfolio, previewTransfer, executeTransfer };