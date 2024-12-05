const express = require('express');
const { getAggregatedPortfolio } = require('../controllers/aggregatedPortfolioController');
const { getMeshHealthStatus } = require('../controllers/healthStatusControllers');
const { getHoldings } = require('../controllers/holdingsController');
const { getMeshIntegrations } = require('../controllers/integrationsController');
const { getLinkToken } = require('../controllers/linkTokenController');
const { getMeshNetworks } = require('../controllers/networksController');
const { previewTransfer, executeTransfer } = require('../controllers/transferController');
const { getMeshTransferIntegrations } = require('../controllers/transferIntegrationController');

const router = express.Router();

router.get('/meshhealth', getMeshHealthStatus); // Endpoint to get Mesh Health Status
router.get('/meshintegrations', getMeshIntegrations); // Endpoint to get all Mesh Integrations
router.post('/linktoken', getLinkToken); // Endpoint to get Link Token

// Managed Transfers API Endpoints
router.get('/meshnetworks', getMeshNetworks); // Endpoint to get Mesh Networks
router.post('/previewtransfer', previewTransfer); // Endpoint to preview a transfer
router.post('/executetransfer', executeTransfer); // Endpoint to execute a transfer
router.get(`/meshtransferintegrations`, getMeshTransferIntegrations); // Endpoint to get Managed Transfers Integrations

// Portfolio API Endpoints
router.post('/holdings', getHoldings); // Endpoint to get Holdings
router.get('/aggregatedportfolio', getAggregatedPortfolio); // Endpoint to get Aggregated Portfolio

module.exports = router;