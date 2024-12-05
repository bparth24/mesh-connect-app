# Mesh Connect App

A sample app using Mesh APIs.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js and npm.
- You have a Mesh Connect Client ID and Secret Key by signing up on (Mesh Connect Website) [https://www.meshconnect.com/].

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/bparth24/mesh-connect-app.git
   cd mesh-connect-app
   ```

2. Set up environment variables:

   - Create a `.env` file in the `frontend` and `mesh-middleware` directories.
   - Add your Mesh Connect Client ID and Secret Key to the `.env` files.

   Example `.env` file for `frontend`:

   ```env
   VITE_APP_MESH_MIDDLEWARE_API_BASE_URL='http://localhost:3001/api'
   PORT=3006
   DISABLE_ESLINT_PLUGIN=true
   ```

   Example `.env` file for `mesh-middleware`:

   ```env
   MESH_SANDBOX_API_BASE_URL=<sandbox-api-base-url>
   MESH_SANDBOX_API_KEY=<your-sandbox-api-key>
   MESH_CLIENT_ID=<your-client-id>
   PORT=3001
   ```

3. Install dependencies:

   ```sh
   cd frontend
   npm install or yarn install // TODO: double check
   cd ../mesh-middleware
   npm install
   ```

## Running the Application

1. Start the backend server:

   ```sh
   cd mesh-middleware
   npm start
   ```

2. Start the frontend application:

   ```sh
   cd frontend
   yarn start
   ```

3. Open your browser and navigate to `http://localhost:3006`.

## Demoable Features

### User Login

1. Open the application in your browser.
2. Enter a username in the login form and click "Login".
3. The username will be temporary stored and used for subsequent operations.

### Integration Selection

1. After logging in, select a category and type from the dropdown menus.
2. Click "Save Selection" to save the selected integration.
3. The selected integration will be stored in PouchDB and displayed on the screen.

### Launch Link and Connect to Coinbase

1. Click "Launch Link" to connect to Coinbase.
2. The application will fetch a link token and open the Mesh Link UI.
3. Follow the instructions in the Mesh Link UI to connect your Coinbase account.

### Fetch Holdings and Aggregated Portfolio

1. Click "Fetch Holdings" to retrieve the user's cryptocurrency holdings from Coinbase.
2. Click "Fetch Aggregated Portfolio" to retrieve the user's aggregated portfolio data.
3. The fetched data will be displayed on the screen in a tabular format.

### Payment Flow using Managed Transfer APIs

1. Enter the amount, select the network, and enter the recipient address.
2. Click "Preview Transfer" to preview the transfer details.
3. Click "Confirm Pay" to execute the transfer.
4. The payment status and response data will be displayed on the screen.

### Payment Flow using Link UI

1. Enter the amount, select the network, and enter the recipient address.
2. Click "Pay" to initiate the payment process using the Mesh Link UI.
3. Follow the instructions in the Mesh Link UI to complete the payment.
4. The payment status and response data will be displayed on the screen.

## Additional Information

- The backend server uses Express and PouchDB for data storage.
- On shutting down the backend server PouchDB data will be deleted. _Note:_ This is intentional for demo purpose with sandbox enviorment.
- The frontend application is built with React and uses the Mesh Web Link SDK & uses Mesh-Middleware to communicate with Mesh APIs.
- The application demonstrates various features such as user login, (exchange/wallets) integration selection, fetching holdings, portfolios and executing payments using two approaches a) Mesh Managed Transfer APIs and b) Link UI.
