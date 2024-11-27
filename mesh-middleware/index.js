const express = require('express');
const { getLinkToken, getMeshHealthStatus, getMeshIntegrations } = require('./meshMiddleware');

const app = express();
app.use(express.json());

// Middleware health check endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'Middleware is running' });
});

// Mesh API Endpoints
app.get(`/api/meshhealth`, getMeshHealthStatus); // Endpoint to get Mesh Health Status
app.get(`/api/meshintegrations`, getMeshIntegrations); // Endpoint to get Integrations
app.post(`/api/linktoken`, getLinkToken); // Endpoint to get Link Token


const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});