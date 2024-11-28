const express = require('express');
const { getLinkToken, getMeshHealthStatus, getMeshIntegrations, getMeshNetworks, getMeshTransferIntegrations, getHoldings } = require('./meshMiddleware');

const app = express();
app.use(express.json());

// Middleware health check endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'Middleware is running' });
});

// Mesh API Endpoints
app.get(`/api/meshhealth`, getMeshHealthStatus); // Endpoint to get Mesh Health Status
app.get(`/api/meshintegrations`, getMeshIntegrations); // Endpoint to get all Mesh Integrations
app.get(`/api/meshnetworks`, getMeshNetworks); // Endpoint to get Mesh Networks
app.get(`/api/meshtransferintegrations`, getMeshTransferIntegrations); // Endpoint to get Managed Transfers Integrations

app.post(`/api/linktoken`, getLinkToken); // Endpoint to get Link Token

// Portfolio API Endpoints
app.post(`/api/holdings`, getHoldings); // Endpoint to get Holdings

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});