import React, { useState, useCallback, useEffect } from "react";
import {
  IntegrationProvider,
  useIntegration,
} from "../context/IntegrationContext";
import { NetworkProvider } from "../context/NetworkContext";
import {
  Container,
  Section,
  Title,
  Button,
} from "../components/StyledComponents";
import { meshMiddlewareApiUrl } from "../utility/config";
import { createLink } from "@meshconnect/web-link-sdk";
import { IntegrationPayload } from "../types/Types";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import Login from "../components/Login";
import PaymentFlow from "../components/PaymentFlow";
import LinkUIPaymentFlow from "../components/LinkUIPaymentFlow";
import SelectionSection from "../components/SelectionSection";
import LinkSection from "../components/LinkSection";
import PortfolioSection from "../components/PortfolioSection";

/**
 * The `App` component serves as the root component for the application.
 * It wraps the main content of the app with the necessary context providers.
 *
 * Providers:
 * - `IntegrationProvider`: Provides integration-related context to the app.
 * - `NetworkProvider`: Provides network-related context to the app.
 *
 * @returns {JSX.Element} The rendered component tree with context providers.
 */
export const App: React.FC = () => {
  return (
    <IntegrationProvider>
      <NetworkProvider>
        <AppContent />
      </NetworkProvider>
    </IntegrationProvider>
  );
};

/**
 * The `AppContent` component is the main content of the application, responsible for managing the state and interactions related to user login, integration selection, and portfolio management.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <AppContent />
 *
 * @remarks
 * This component handles the following functionalities:
 * - User login and logout
 * - Integration selection and saving
 * - Launch link - Connect to Coinbase
 * - Fetching and displaying the user's holdings and aggregated portfolio
 * - Managing state for various aspects of the application, including error handling and success messages
 *
 */
const AppContent: React.FC = () => {
  // State for login/logout
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientId, setUsername] = useState<string>(""); // Username of the client only - Initialize as empty string

  const { categories, types, categoryTypeMap } = useIntegration(); // Integration context state

  const [clientDocId, setClientDocId] = useState<string>(""); // Document ID for the client in the format of username_category_type (e.g., alice_exchange_coinbase) - Initialize as empty string
  const [integrationId, setIntegrationId] = useState<string>(""); // Integration ID for the selected category and type - Initialize as empty string
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [aggregatedPortfolio, setAggregatedPortfolio] = useState<any | null>(
    null
  );
  const [integrationPayload, setIntegrationPayload] = useState<any | null>(
    null
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // error and success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve login state from localStorage
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedClientId = localStorage.getItem("clientId");
    if (storedIsLoggedIn === "true" && storedClientId) {
      setIsLoggedIn(true);
      setUsername(storedClientId);
    }
  }, []);

  /**
   * Handles the save selection process by constructing a document ID, storing it in local storage,
   * and sending the selected integration data to the server.
   *
   * @async
   * @function handleSaveSelection
   * @throws Will throw an error if the fetch request fails.
   *
   * @remarks
   * The function performs the following steps:
   * 1. Constructs a document ID using `clientId`, `selectedCategory`, and `selectedType` with an underscore.
   * 2. Stores the constructed document ID and `integrationId` in local storage.
   * 3. Creates an object `selectedIntegration` containing the necessary data.
   * 4. Sends a POST request to the server with the `selectedIntegration` data.
   * 5. If the request is successful, updates the state with the new document ID and sets a success message.
   * 6. If the request fails, logs the error and sets an error message.
   */
  const handleSaveSelection = async () => {
    try {
      const docId = `${clientId}_${selectedCategory}_${selectedType}`; // Construct the client Doc ID directly
      localStorage.setItem("clientDocId", docId); // Store clientDocId in local storage
      localStorage.setItem("integrationId", integrationId); // Store integrationId in local storage
      console.log("handleSaveSelection -> ClientDocId:", docId); // Debugging log

      // console.log("handleSaveSelection -> Client Doc ID:", clientDocId); // Debugging log
      const selectedIntegration = {
        _id: docId, // // Use the constructed Doc ID
        clientId: clientId, // Username of the client
        integrationId: integrationId,
        category: selectedCategory,
        type: selectedType,
      };

      const response = await fetch(`${meshMiddlewareApiUrl}/db/save-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedIntegration),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log("handleSaveSelection -> Save selection response:", data); // Debugging log
      // Update the state after the save operation
      setClientDocId(docId);
      console.log(" handleSaveSelection -> ClientDocId:", clientDocId); // Debugging log
      setSuccessMessage(
        `Selection saved successfully with data: ${JSON.stringify(
          selectedIntegration,
          null,
          2
        )}`
      );
    } catch (err) {
      console.error("handleSaveSelection -> Error saving selection:", err); // Log the error
      setError((err as Error).message);
    }
  };

  /**
   * Handles the launch of the link by fetching a link token and opening the link.
   *
   * This function performs the following steps:
   * 1. Checks if the integrationId is available. If not, sets an error message.
   * 2. Sends a POST request to the mesh middleware API to fetch a link token.
   * 3. If the request fails, throws an error.
   * 4. Parses the response to extract the link token.
   * 5. Sets the link token in the state.
   * 6. Stores the link token in local storage.
   * 7. Opens the link using the fetched link token.
   *
   * @async
   * @function handleLaunchLink
   * @throws Will throw an error if the request to fetch the link token fails.
   */
  const handleLaunchLink = useCallback(async () => {
    if (!integrationId) {
      setError("Please get or enter the integration id first");
      return;
    }
    console.log("handleLaunchLink -> userId", clientId); // Debugging log

    try {
      // console.log("Request URL:", `${meshMiddlewareApiUrl}/linktoken`); // Debugging log
      const response = await fetch(`${meshMiddlewareApiUrl}/linktoken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: clientId, // userId is the username of the client
          integrationId: integrationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get link token");
      }

      const data = await response.json();
      console.log("handleLaunchLink -> linktoken api response:", data); // Debugging log
      setLinkToken(data.content.linkToken);

      localStorage.setItem("linkToken", data.content.linkToken); // Store linkToken in local storage
      openLink(data.content.linkToken); // Logic to connect to Coinbase account using the link token
    } catch (err) {
      setError((err as Error).message);
    }
  }, [integrationId, clientDocId]);

  /**
   * Updates a document in the database with the provided data.
   *
   * @param {string} id - The unique identifier of the document to be updated.
   * @param {string} linkToken - The link token associated with the document.
   * @param {IntegrationPayload} integrationPayload - The payload containing integration data.
   * @throws {Error} Throws an error if the integration payload structure is invalid.
   * @throws {Error} Throws an error if the response from the server is not ok.
   * @returns {Promise<void>} A promise that resolves when the document is successfully updated.
   */
  const updateDocWithData = async (
    id: string,
    linkToken: string,
    integrationPayload: IntegrationPayload
  ) => {
    // Error handling before accessing variables
    if (
      !integrationPayload ||
      !integrationPayload.accessToken ||
      !integrationPayload.accessToken.accountTokens ||
      !integrationPayload.accessToken.accountTokens[0]
    ) {
      throw new Error("Invalid integration payload structure");
    }

    const accessToken =
      integrationPayload.accessToken.accountTokens[0].accessToken;

    try {
      const response = await fetch(`${meshMiddlewareApiUrl}/db/update-doc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
          linkToken,
          accessToken,
          integrationPayload, // for future use
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log("updateDocWithData -> update doc response:", data); // Debugging log
      setSuccessMessage(
        `Database updated with data: ${JSON.stringify({ data }, null, 2)}`
      );
    } catch (err) {
      console.error("updateDocWithData -> Error updating doc:", err); // Log the error
      setError((err as Error).message);
    }
  };

  /**
   * Opens a link using the provided token and sets up various event handlers.
   *
   * @param {string} token - The token used to open the link.
   *
   * The function sets up the following event handlers:
   * - `onIntegrationConnected`: Logs the integration payload and updates the state with the integration payload.
   * - `onExit`: Logs any errors and the summary if available.
   * - `onTransferFinished`: Logs the transfer data when the transfer is finished.
   * - `onEvent`: Handles various events, specifically the `integrationConnected` event to update the document with the link token and integration payload data.
   *
   * The function also logs debugging information and updates the document with the integration payload data when the `integrationConnected` event occurs.
   */
  const openLink = (token: string) => {
    console.log("openLink -> clientId, clientDocId:", clientId, clientDocId); // Debugging log
    const meshLink = createLink({
      clientId: clientId,
      onIntegrationConnected: (payload) => {
        console.log("openLink -> Integration connected:", payload);
      },
      onExit: (error, summary) => {
        if (error) {
          console.error("openLink -> Error:", error);
        }
        if (summary) {
          console.log("openLink -> Summary:", summary);
        }
      },
      onTransferFinished: (transferData) => {
        console.log("openLink -> Transfer finished:", transferData);
      },
      onEvent: (event) => {
        console.log("openLink -> Event:", event);
        if (event.type === "integrationConnected") {
          const payload = event.payload as IntegrationPayload;
          setIntegrationPayload(payload); // Set the integration payload state
          // Update the document with link token and integration payload data.
          updateDocWithData(clientDocId, token, payload);
          console.log(
            "openLink -> Updated Doc with integration payload:",
            payload
          );
        }
      },
    });
    meshLink.openLink(token);
  };

  /**
   * Fetches the portfolio data based on the selected category, type, and clientId.
   * Constructs a unique Id using the clientId, selected category, and selected type.
   * Sends a POST request to the mesh middleware API to retrieve the portfolio data.
   * If the request is successful, updates the portfolio state with the fetched data.
   * If the request fails, sets an error message.
   *
   * @async
   * @function handleFetchPortfolio
   * @returns {Promise<void>} A promise that resolves when the portfolio data is fetched and state is updated.
   * @throws {Error} Throws an error if the fetch request fails.
   */
  const handleFetchPortfolio = useCallback(async () => {
    try {
      const id = `${clientId}_${selectedCategory}_${selectedType}`;
      //TODO: Handle refresh token logic
      const response = await fetch(`${meshMiddlewareApiUrl}/holdings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), // pass the document id and get the access token from the db on the mesh middleware side
      });

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }

      const data = await response.json();
      console.log("Portfolio response:", data); // Debugging log
      setPortfolio(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [selectedCategory, selectedType, clientId]);

  /**
   * Fetches the aggregated portfolio data for the specified clientId.
   *
   * This function makes an asynchronous GET request to the mesh middleware API
   * to retrieve the aggregated portfolio data for the user identified by `clientId`.
   * If the request is successful, the response data is set to the state using
   * `setAggregatedPortfolio`. If the request fails, an error message is set using
   * `setError`.
   *
   * @async
   * @function handleFetchAggregatedPortfolio
   * @returns {Promise<void>} A promise that resolves when the fetch operation is complete.
   * @throws {Error} Throws an error if the fetch operation fails.
   */
  const handleFetchAggregatedPortfolio = useCallback(async () => {
    try {
      const id = `${clientId}`;
      //TODO: Handle refresh token logic
      const response = await fetch(
        `${meshMiddlewareApiUrl}/aggregatedportfolio/?UserId=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch aggregated portfolio");
      }

      const data = await response.json();
      console.log("Aggregated Portfolio response:", data); // Debugging log
      setAggregatedPortfolio(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [selectedCategory, selectedType, clientId]);

  // For testing and debugging purposes only
  // const handleCopy = (text: string) => {
  //   navigator.clipboard.writeText(text);
  //   setCopyStatus(true);
  //   //setTimeout(() => setCopyStatus(false), 2000) // Reset copy status after 2 seconds
  // };

  useEffect(() => {
    if (selectedCategory && selectedType) {
      const id = categoryTypeMap[selectedCategory]?.[selectedType];
      setIntegrationId(id);
    }
  }, [selectedCategory, selectedType, categoryTypeMap]);

  const closeModal = () => {
    setError(null);
  };

  const closeSuccessModal = () => {
    setSuccessMessage(null);
  };

  /**
   * Handles the login process by setting the login state, username/clientId, and storing the login information in local storage.
   *
   * @param {string} clientId - The client Id to be set as the username.
   */
  const handleLogin = (clientId: string) => {
    setIsLoggedIn(true);
    setUsername(clientId);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("clientId", clientId);
  };

  /**
   * Handles the user logout process by performing the following actions:
   * - Sets the user login state to false.
   * - Clears the username/clientId.
   * - Removes various items from local storage.
   * - Resets multiple state variables to their initial values.
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("clientId");
    localStorage.removeItem("clientDocId");
    localStorage.removeItem("integrationId");
    localStorage.removeItem("linkToken");
    setClientDocId("");
    setError(null);
    setIntegrationId("");
    setLinkToken(null);
    setPortfolio(null);
    setAggregatedPortfolio(null);
    setIntegrationPayload(null);
    setSelectedCategory("");
    setSelectedType("");
    setSuccessMessage(null);
  };

  return (
    <Container>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <Section>
            <Title>
              Welcome, {clientId}! <span></span> Mesh Connect App
            </Title>
            <Button onClick={handleLogout}>Logout</Button>
            <p>
              <strong>User ID: </strong> {clientId}
            </p>
          </Section>

          {/* Selection Section Component */}
          <SelectionSection
            categories={categories}
            types={types}
            selectedCategory={selectedCategory}
            selectedType={selectedType}
            integrationId={integrationId}
            setSelectedCategory={setSelectedCategory}
            setSelectedType={setSelectedType}
            handleSaveSelection={handleSaveSelection}
          ></SelectionSection>

          {/* Link Selection Component */}
          <LinkSection
            clientId={clientId}
            integrationId={integrationId}
            linkToken={linkToken}
            integrationPayload={integrationPayload}
            handleLaunchLink={handleLaunchLink}
          ></LinkSection>

          {/* Portfolio Section Component */}
          <PortfolioSection
            portfolio={portfolio}
            aggregatedPortfolio={aggregatedPortfolio}
            handleFetchPortfolio={handleFetchPortfolio}
            handleFetchAggregatedPortfolio={handleFetchAggregatedPortfolio}
          ></PortfolioSection>

          {/* Payment flow using Managed Transfer APIs (PreviewTransfer, ExecuteTransfer) */}
          <PaymentFlow clientDocId={clientDocId} selectedType={selectedType} />

          {/* Payment flow using Link UI */}
          <LinkUIPaymentFlow
            clientDocId={clientDocId}
            selectedType={selectedType}
            integrationPayload={integrationPayload}
          />

          {error && <ErrorModal message={error} onClose={closeModal} />}
          {successMessage && (
            <SuccessModal
              message={successMessage}
              onClose={closeSuccessModal}
            />
          )}
        </div>
      )}
    </Container>
  );
};

export default App;
