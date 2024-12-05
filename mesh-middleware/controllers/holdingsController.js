const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');
const { handleGetData } = require('../services/pouchDBService');

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

module.exports = { getHoldings };