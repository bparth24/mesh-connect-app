// Sets up the Express server and defines the routes.
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const { getLinkToken, getMeshHealthStatus, getMeshIntegrations, getMeshNetworks, getMeshTransferIntegrations, getHoldings, getAggregatedPortfolio, previewTransfer } = require('./meshMiddleware');
const { handleSaveData, handleGetData, handleUpdateDoc, handleFilterData, displayAllDocs, cleanupAllDocs } = require('./pouchdbService');

const app = express();
app.use(express.json());
app.use(cors()); // Use the cors middleware

// Middleware health check endpoint
app.get('/api/status', (req, res) => { res.json({ status: 'Middleware is running' }); });

// Redis DB API Endpoints
app.post('/api/db/save-data', handleSaveData);
app.get('/api/db/get-data/:id', handleGetData);
app.put('/api/db/update-doc', handleUpdateDoc);
app.post('/api/db/filter', handleFilterData);
app.get('/api/db/all-docs', displayAllDocs);

// Mesh API Endpoints
app.get(`/api/meshhealth`, getMeshHealthStatus); // Endpoint to get Mesh Health Status
app.get(`/api/meshintegrations`, getMeshIntegrations); // Endpoint to get all Mesh Integrations

// Link Token API Endpoint
app.post(`/api/linktoken`, getLinkToken); // Endpoint to get Link Token

// Managed Transfers API Endpoints
app.get(`/api/meshnetworks`, getMeshNetworks); // Endpoint to get Mesh Networks
app.get(`/api/meshtransferintegrations`, getMeshTransferIntegrations); // Endpoint to get Managed Transfers Integrations
app.post(`/api/previewtransfer`, previewTransfer); // Endpoint to preview a transfer

// Portfolio API Endpoints
app.post(`/api/holdings`, getHoldings); // Endpoint to get Holdings
app.get(`/api/aggregatedportfolio`, getAggregatedPortfolio); // Endpoint to get Aggregated Portfolio

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});

// Cleanup all documents on server shutdown
const shutdown = async (signal) => {
    console.log(`${signal} signal received: cleaning up all documents...`);
    await cleanupAllDocs();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));