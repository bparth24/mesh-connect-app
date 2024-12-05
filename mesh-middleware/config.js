require('dotenv').config();

const MESH_SANDBOX_API_BASE_URL = process.env.MESH_SANDBOX_API_BASE_URL;
const MESH_SANDBOX_API_KEY = process.env.MESH_SANDBOX_API_KEY;
const MESH_CLIENT_ID = process.env.MESH_CLIENT_ID;
// const MESH_COINBASE_ACCESS_TOKEN = process.env.MESH_COINBASE_ACCESS_TOKEN;
const MESH_HEADERS = {
    'X-Client-Secret': MESH_SANDBOX_API_KEY,
    'X-Client-Id': MESH_CLIENT_ID,
    'Content-Type': 'application/json'
};

module.exports = { MESH_SANDBOX_API_BASE_URL, MESH_HEADERS };