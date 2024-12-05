const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');
const { handleGetData, handleUpdateDoc } = require('../services/pouchdbService');

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

module.exports = { previewTransfer, executeTransfer };