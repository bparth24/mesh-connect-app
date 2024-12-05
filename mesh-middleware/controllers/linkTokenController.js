const axios = require('axios');
const { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS } = require('../config');

/**
 * Generates a link token for the specified user and integration.
 *
 * @async
 * @function getLinkToken
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.userId - The ID of the user.
 * @param {Object} [req.body.transferOptions] - Optional transfer options.
 * @param {string} req.body.integrationId - The ID of the integration.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the link token is generated and sent in the response.
 * @throws {Error} Throws an error if the link token generation fails.
 */
const getLinkToken = async (req, res) => {
    const { userId, transferOptions, integrationId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }
    console.log("getLinkToken -> ", { "userId": userId, "transferOptions": transferOptions, "integrationId": integrationId }); // Debugging purposes

    const bodyContent = JSON.stringify({
        userId: userId,
        transferOptions: transferOptions,
        integrationId: integrationId
    });

    try {
        const response = await axios.post(`${MESH_SANDBOX_API_BASE_URL}/v1/linktoken`, bodyContent, { headers: MESH_HEADERS });
        console.log("getLinkToken -> linktoken api response", response.data);
        res.json(response.data);
    } catch (error) {
        console.error('getLinkToken -> Error fetching link token:', error.message);
        res.status(500).json({ error: 'Internal Server Error - Fetching Link Token' });

    }
};

module.exports = { getLinkToken };