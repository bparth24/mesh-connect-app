import React, { useState, useCallback, useEffect } from "react";
import {
  Container,
  Section,
  Title,
  Button,
  Input,
  CopyButton,
  InputWrapper,
  Table,
  Th,
  Td,
  Tr,
  Label,
  Select,
  IntegrationIdDisplay,
  theme,
} from "../components/StyledComponents";
import { meshMiddlewareApiUrl } from "../utility/config";
import { createLink } from "@meshconnect/web-link-sdk";
import {
  IntegrationItem,
  IntegrationResponse,
  IntegrationPayload,
} from "../types/Types";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import Login from "../components/Login";
import PaymentFlow from "../components/PaymentFlow";
import LinkUIPaymentFlow from "../components/LinkUIPaymentFlow";
// import PaymentFlow2 from "../components/PaymentFlow2";

export const App: React.FC = () => {
  // State for login/logout
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientId, setUsername] = useState<string>(""); // Username of the client only - Initialize as empty string
  const [clientDocId, setClientDocId] = useState<string>(""); // Document ID for the client in the format of username_category_type (e.g., alice_exchange_coinbase) - Initialize as empty string
  const [error, setError] = useState<string | null>(null);
  const [integrationId, setIntegrationId] = useState<string>("");
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [aggregatedPortfolio, setAggregatedPortfolio] = useState<any | null>(
    null
  );
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [inputIntegrationId, setInputIntegrationId] = useState<string>("");
  const [integrationPayload, setIntegrationPayload] = useState<any | null>(
    null
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [categoryTypeMap, setCategoryTypeMap] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Clear linkToken on component mount (page refresh)
    localStorage.removeItem("linkToken");
    setLinkToken(null);

    // Reset copy status on component mount (page refresh)
    setCopyStatus(false);

    // Retrieve linkToken from local storage if available
    const storedLinkToken = localStorage.getItem("linkToken");
    if (storedLinkToken) {
      setLinkToken(storedLinkToken);
      openLink(storedLinkToken);
    }

    // Retrieve login state from localStorage
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedClientId = localStorage.getItem("clientId");
    if (storedIsLoggedIn === "true" && storedClientId) {
      setIsLoggedIn(true);
      setUsername(storedClientId);
    }
    // Make API call to get integration IDs on page load -- TODO: Update the function name
    handleGetIntegrationId();
  }, []);

  const handleGetIntegrationId = useCallback(async () => {
    try {
      // Reset copy status when fetching a new integration id
      // setCopyStatus(false)

      console.log("Request URL:", `${meshMiddlewareApiUrl}/meshintegrations`); // Debugging log
      const response = await fetch(`${meshMiddlewareApiUrl}/meshintegrations`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to get integration id");
      }

      const data = await response.json();
      console.log("Integration ID response:", data); // Debugging log

      // Extract unique categories and types
      const uniqueCategories: string[] = Array.from(
        new Set(
          data.content.items.flatMap((item: IntegrationItem) => item.categories)
        )
      );
      const uniqueTypes: string[] = Array.from(
        new Set(data.content.items.map((item: IntegrationItem) => item.type))
      );

      // Create a mapping object to store the id for each combination of category and type
      const map: { [key: string]: { [key: string]: string } } = {};
      data.content.items.forEach((item: IntegrationItem) => {
        item.categories.forEach((category: string) => {
          if (!map[category]) {
            map[category] = {};
          }
          map[category][item.type] = item.id;
        });
      });

      setCategories(uniqueCategories);
      setTypes(uniqueTypes);
      setCategoryTypeMap(map);

      // setIntegrationId(data.integrationId)
    } catch (err) {
      console.error("Error fetching integration id:", err); // Log the error
      setError((err as Error).message);
    }
  }, []);

  // Save the selected category, type and integration id to the database for future reference
  const handleSaveSelection = async () => {
    try {
      const docId = `${clientId}_${selectedCategory}_${selectedType}`; // Construct the client Doc ID directly
      console.log("Client Doc ID:", docId); // Debugging log
      localStorage.setItem("clientDocId", docId); // Store clientDocId in local storage
      localStorage.setItem("integrationId", integrationId); // Store integrationId in local storage

      // setClientDocId(`${clientId}_${selectedCategory}_${selectedType}`); // Set the client Doc ID as a combination of username, category and type with an underscore
      // console.log("Client Doc ID:", clientDocId); // Debugging log
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
      console.log("Save selection response:", data); // Debugging log
      // Update the state after the save operation
      setClientDocId(docId);
      console.log("handleSaveSelection >> Client Doc ID:", clientDocId); // Debugging log
      setSuccessMessage(
        `Selection saved successfully with data: ${JSON.stringify(
          selectedIntegration,
          null,
          2
        )}`
      );
    } catch (err) {
      console.error("Error saving selection:", err); // Log the error
      setError((err as Error).message);
    }
  };

  const handleLaunchLink = useCallback(async () => {
    const idToUse = inputIntegrationId || integrationId; // TODO: Remove inputIntegrationId and use integrationId only
    if (!idToUse) {
      setError("Please get or enter the integration id first");
      return;
    }
    console.log("handleLaunchLink -- userId", clientId); // Debugging log

    try {
      console.log("Request URL:", `${meshMiddlewareApiUrl}/linktoken`); // Debugging log
      const response = await fetch(`${meshMiddlewareApiUrl}/linktoken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: clientId, integrationId: idToUse }), // userId is the username of the client
      });

      if (!response.ok) {
        throw new Error("Failed to get link token");
      }

      const data = await response.json();
      console.log("Link Token response:", data); // Debugging log
      setLinkToken(data.content.linkToken);
      // Save linkToken in PouchDB -- leaving it here tonight -- start fron here tomorrow

      localStorage.setItem("linkToken", data.content.linkToken); // Store linkToken in local storage
      openLink(data.content.linkToken); // Logic to connect to Coinbase account using the link token

      // // Update the document with link token and integration payload data.
      // await updateDocWithData(`${clientId}_${selectedCategory}_${selectedType}`, data.content.linkToken, integrationPayload)
    } catch (err) {
      setError((err as Error).message);
    }
  }, [inputIntegrationId, integrationId, clientDocId]);

  // update to db function
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
          integrationPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log("Update document response:", data); // Debugging log
      setSuccessMessage(
        `Database updated with data: ${JSON.stringify({ data }, null, 2)}`
      );
    } catch (err) {
      console.error("Error updating document:", err); // Log the error
      setError((err as Error).message);
    }
  };

  const openLink = (token: string) => {
    console.log("clientId, clientDocId:", clientId, clientDocId); // Debugging log
    const meshLink = createLink({
      clientId: clientId,
      onIntegrationConnected: (payload) => {
        console.log("Integration connected:", payload);
      },
      onExit: (error, summary) => {
        if (error) {
          console.error("Error:", error);
        }
        if (summary) {
          console.log("Summary:", summary);
        }
      },
      onTransferFinished: (transferData) => {
        console.log("Transfer finished:", transferData);
      },
      onEvent: (event) => {
        console.log("Event:", event);
        if (event.type === "integrationConnected") {
          const payload = event.payload as IntegrationPayload;
          setIntegrationPayload(payload); // Set the integration payload state
          // Update the document with link token and integration payload data.
          updateDocWithData(clientDocId, token, payload);
          console.log("Updated Doc with integration payload:", payload);
        }
      },
    });
    meshLink.openLink(token);
  };

  //   handleFetchPortfolio is fetching the holdings of the user
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

  // handleAggregatePortfolio is fetching the aggregated holdings of the user
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    //setTimeout(() => setCopyStatus(false), 2000) // Reset copy status after 2 seconds
  };

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

  const handleLogin = (clientId: string) => {
    setIsLoggedIn(true);
    setUsername(clientId);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("clientId", clientId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("clientId");
    localStorage.removeItem("clientDocId");
    localStorage.removeItem("integrationId");
    setClientDocId("");
    setError(null);
    setIntegrationId("");
    setLinkToken(null);
    setPortfolio(null);
    setAggregatedPortfolio(null);
    setPaymentStatus(null);
    setCopyStatus(false);
    setInputIntegrationId("");
    setIntegrationPayload(null);
    setCategories([]);
    setTypes([]);
    setSelectedCategory("");
    setSelectedType("");
    setCategoryTypeMap({});
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
              <strong>User ID: </strong> {clientId}{" "}
            </p>
          </Section>

          <Section>
            <Title>Select Connected Account Category & Type</Title>
            <div>
              <Label htmlFor="category">Category:</Label>
              <Select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type:</Label>
              <Select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Select Type</option>
                {types.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            {integrationId && (
              <IntegrationIdDisplay>
                <strong>Selected ID:</strong> {integrationId}
              </IntegrationIdDisplay>
            )}
            <Button onClick={handleSaveSelection}>Save Selection</Button>

            {/* Below Old Logic */}

            {/* <Button onClick={handleGetIntegrationId}>Get Integration Id</Button>
        {integrationId && (
          <div>
            <p><strong>User Id: </strong> {clientId}</p>
            <p><strong>Coinbase Integration Id: </strong>{integrationId}</p>
            <CopyButton onClick={() => handleCopy(integrationId)}>
              {copyStatus ? 'Copied!' : 'Copy'}
            </CopyButton>
          </div>
        )} */}
          </Section>

          <Section>
            <Title>Launch Link & Connect to Coinbase</Title>
            {integrationId && (
              <div>
                <p>
                  <strong>User Id: </strong> {clientId}
                </p>
                <p>
                  <strong>Coinbase Integration Id: </strong>
                  {integrationId}
                </p>
              </div>
            )}
            <Button onClick={handleLaunchLink}>Launch Link</Button>
            {/* <InputWrapper>
             <Input
                value={inputIntegrationId}
                onChange={(e) => setInputIntegrationId(e.target.value)}
                placeholder="Paste Coinbase Integration Id here"
            /> 
        </InputWrapper> */}
            {/* <p><strong>Note:</strong> User Id is passed in the body.</p> */}
            {linkToken && (
              <p style={{ wordWrap: "break-word" }}>
                <strong>Link Token:</strong> {linkToken}
              </p>
            )}
            {integrationPayload && (
              <p>
                <strong>Message: </strong>Coinbase Exchange - Connected
                Successfully! <br></br>
              </p>
              // debugging purposes
              //   <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}><strong>Message: <br></br> </strong>
              //     {JSON.stringify(integrationPayload, null, 2)}
              //   </pre>
            )}
          </Section>

          <Section>
            <Title>Coinbase Portfolio & Holdings</Title>
            <Button onClick={handleFetchPortfolio}>Fetch Holdings</Button>
            <span> </span>
            <Button onClick={handleFetchAggregatedPortfolio}>
              Fetch Aggregated Portfolio
            </Button>

            {portfolio && (
              <div>
                <Title>Coinbase Holdings</Title>
                <Table>
                  <thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Symbol</Th>
                      <Th>Amount</Th>
                      <Th>Cost Basis</Th>
                    </Tr>
                  </thead>
                  <tbody>
                    {portfolio.content.cryptocurrencyPositions.map(
                      (item: any, index: number) => (
                        <Tr key={index}>
                          <Td>{item.name}</Td>
                          <Td>{item.symbol}</Td>
                          <Td>{item.amount}</Td>
                          <Td>${item.costBasis}</Td>
                        </Tr>
                      )
                    )}
                  </tbody>
                </Table>
                {/* Debugging Purposes */}
                {/* <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}><strong>Coinbase Portfolio JSON:<br></br> </strong>
              {JSON.stringify(portfolio, null, 2)}
            </pre> */}
              </div>
            )}
            {aggregatedPortfolio && (
              <div>
                <Title>Coinbase Portfolio</Title>
                <p>
                  <strong>Portfolio Cost Basis:</strong> $
                  {aggregatedPortfolio.content.portfolioCostBasis}
                </p>
                <p>
                  <strong>Actual Portfolio Performance:</strong>{" "}
                  {aggregatedPortfolio.content.actualPortfolioPerformance}%
                </p>
                <p>
                  <strong>Equities Value:</strong> $
                  {aggregatedPortfolio.content.equitiesValue}
                </p>
                <p>
                  <strong>Cryptocurrencies Value:</strong> $
                  {aggregatedPortfolio.content.cryptocurrenciesValue}
                </p>
                <p>
                  <strong>NFTs Value:</strong> $
                  {aggregatedPortfolio.content.nftsValue}
                </p>
                <Table>
                  <thead>
                    <Tr>
                      <Th>Company Name</Th>
                      <Th>Symbol</Th>
                      <Th>Amount</Th>
                      <Th>Cost Basis</Th>
                      <Th>Market Value</Th>
                      <Th>Last Price</Th>
                      <Th>Portfolio Percentage</Th>
                      <Th>Total Return</Th>
                      <Th>Return Percentage</Th>
                    </Tr>
                  </thead>
                  <tbody>
                    {aggregatedPortfolio.content.cryptocurrencyPositions.map(
                      (item: any, index: number) => (
                        <Tr key={index}>
                          <Td>{item.companyName}</Td>
                          <Td>{item.symbol}</Td>
                          <Td>{item.amount}</Td>
                          <Td>${item.costBasis}</Td>
                          <Td>${item.marketValue}</Td>
                          <Td>${item.lastPrice}</Td>
                          <Td>{item.portfolioPercentage}%</Td>
                          <Td>${item.totalReturn}</Td>
                          <Td>{item.returnPercentage}%</Td>
                        </Tr>
                      )
                    )}
                  </tbody>
                </Table>
                {/* <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {JSON.stringify(aggregatedPortfolio, null, 2)}
            </pre> */}
              </div>
            )}
          </Section>
          {/* Payment flow using Managed Transfer APIs (PreviewTransfer, ExecuteTransfer) */}
          <PaymentFlow clientDocId={clientDocId} selectedType={selectedType} />

          {/* Payment flow using Link Token */}
          <LinkUIPaymentFlow
            clientDocId={clientDocId}
            selectedType={selectedType}
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
