import React, { useEffect, useState } from "react";
import {
  Section,
  Title,
  Button,
  Input,
  Label,
  Select,
  DescriptionCard,
  DescriptionText,
  ImageContainer,
  ShoeImage,
  FormContainer,
  FormColumn,
  PaymentStatus,
} from "./StyledComponents";
import { meshMiddlewareApiUrl } from "../utility/config";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";

/**
 * Represents a network in the payment flow.
 *
 * @interface Network
 * @property {string} id - The unique identifier for the network.
 * @property {string} name - The name of the network.
 * @property {string} logoUrl - The URL of the network's logo.
 * @property {string[]} supportedTokens - A list of tokens supported by the network.
 */
interface Network {
  id: string;
  name: string;
  logoUrl: string;
  supportedTokens: string[];
}

/**
 * Props for the PaymentFlow component.
 *
 * @interface PaymentFlowProps
 * @property {string} clientDocId - The document ID of the client.
 * @property {string} selectedType - The selected type for the payment flow.
 */
interface PaymentFlowProps {
  clientDocId: string;
  selectedType: string;
}

/**
 * PaymentFlow component handles the payment process using USDC tokens.
 * It allows users to preview and execute a transfer from a connected account to a specified wallet address.
 *
 * @component
 * @param {PaymentFlowProps} props - The properties for the PaymentFlow component.
 * @param {string} props.clientDocId - The client document ID.
 * @param {string} props.selectedType - The selected account type.
 *
 * @returns {JSX.Element} The rendered PaymentFlow component.
 *
 * @example
 * <PaymentFlow clientDocId="12345" selectedType="Coinbase" />
 *
 * @remarks
 * This component fetches available networks and supported tokens, allows the user to preview a transfer,
 * and then execute the transfer. It also handles loading states, error states, and success messages.
 * The component displays the payment status and provides a modal for error and success messages.
 *
 */
const PaymentFlow: React.FC<PaymentFlowProps> = ({
  clientDocId,
  selectedType,
}) => {
  const [amount, setAmount] = useState<number>(50);
  const [currency, setCurrency] = useState<string>("USDC");
  const [toAddress, setToAddress] = useState<string>(
    "0x0Ff0000f0A0f0000F0F000000000ffFf00f0F0f0"
  );
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>("");
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewResponse, setPreviewResponse] = useState<any>(null);
  const [executeResponse, setExecuteResponse] = useState<any>(null);

  useEffect(() => {
    fetchNetworks();
  }, []);

  useEffect(() => {
    if (selectedNetworkId) {
      const selectedNetwork = networks.find(
        (network) => network.id === selectedNetworkId
      );
      console.log("PaymentFlow -> Selected network:", selectedNetwork); // Debugging log
      if (selectedNetwork) {
        setSupportedTokens(selectedNetwork.supportedTokens);
        // Set default currency to USDC if available, otherwise to the first supported token
        setCurrency(
          selectedNetwork.supportedTokens.includes("USDC")
            ? "USDC"
            : selectedNetwork.supportedTokens[0] || ""
        );
      }
    }
  }, [selectedNetworkId, networks]);

  /**
   * Fetches the list of networks from the mesh middleware API and updates the state with the fetched networks.
   * If the Ethereum network is found in the fetched networks, it sets the selected network ID to Ethereum's ID.
   *
   * @async
   * @function fetchNetworks
   * @throws Will throw an error if the network request fails.
   */
  const fetchNetworks = async () => {
    try {
      const response = await fetch(`${meshMiddlewareApiUrl}/meshnetworks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch networks");
      }

      const data = await response.json();
      setNetworks(data.content.networks);

      // Set default network to Ethereum if it exists
      const ethereumNetwork = data.content.networks.find(
        (network: Network) => network.name === "Ethereum"
      );
      if (ethereumNetwork) {
        setSelectedNetworkId(ethereumNetwork.id);
      }
    } catch (err) {
      console.error("PaymentFlow -> Error fetching networks:", err); // Log the error
      setError((err as Error).message);
    }
  };

  /**
   * Handles the preview transfer process by sending a request to the mesh middleware API.
   * Sets the loading state to true while the request is in progress.
   * If the request is successful and the response is valid, updates the preview ID, preview response, and sets the confirming state to true.
   * If the request fails or the response is invalid, sets an error message.
   * Finally, sets the loading state to false.
   *
   * @async
   * @function handlePreviewTransfer
   * @returns {Promise<void>} A promise that resolves when the preview transfer process is complete.
   * @throws {Error} Throws an error if the preview transfer request fails or the response is invalid.
   */
  const handlePreviewTransfer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${meshMiddlewareApiUrl}/previewtransfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: clientDocId,
          fromType: selectedType,
          networkId: selectedNetworkId,
          symbol: currency,
          toAddress: toAddress,
          amountInFiat: amount,
          fiatCurrency: "USD", // Hardcoded to USD for now
        }),
      });

      if (!response.ok) {
        throw new Error("Preview transfer failed");
      }

      const data = await response.json();
      console.log("PaymentFlow -> Preview transfer response:", data); // Debugging log

      if (data.status === "ok" && data.content && data.content.previewResult) {
        setPreviewId(data.content.previewResult.previewId);
        setPreviewResponse(data);
        setIsConfirming(true);
      } else {
        throw new Error("Invalid preview transfer response");
      }
    } catch (err) {
      console.error("PaymentFlow -> Error previewing transfer:", err); // Log the error
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the execution of a transfer by making a POST request to the mesh middleware API.
   *
   * This function sets the loading state to true, sends a request with the userId to the API,
   * and processes the response. If the transfer is successful, it updates the payment status
   * and sets a success message. If there is an error, it logs the error and sets an error message.
   * The loading state is reset to false after the operation completes.
   *
   * @async
   * @function handleExecuteTransfer
   * @returns {Promise<void>} A promise that resolves when the transfer execution is complete.
   */
  const handleExecuteTransfer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${meshMiddlewareApiUrl}/executetransfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: clientDocId,
        }),
      });

      if (!response.ok) {
        throw new Error("Execute transfer failed");
      }

      const data = await response.json();
      console.log("PaymentFlow -> Execute transfer response:", data); // Debugging log
      setExecuteResponse(data);
      setPaymentStatus(data.content.status);
      setSuccessMessage("Payment successful!");
    } catch (err) {
      console.error("PaymentFlow -> Error executing transfer:", err); // Log the error
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setError(null);
  };

  const closeSuccessModal = () => {
    setSuccessMessage(null);
  };

  return (
    <Section>
      <Title>Payment Flow</Title>
      <DescriptionCard>
        <DescriptionText>
          Pay $50 in Fiat using USDC tokens from Connected Account (e.g.
          Coinbase) to the test wallet address
          '0x0Ff0000f0A0f0000F0F000000000ffFf00f0F0f0' over Ethereum Network.
        </DescriptionText>
      </DescriptionCard>
      <FormContainer>
        <FormColumn flexvalue={2}>
          <div>
            <Label htmlFor="amount">Amount (USD):</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="fromType">From Account Type:</Label>
            <Input id="fromType" value={selectedType} disabled />
          </div>
          <div>
            <Label htmlFor="toAddress">To Address:</Label>
            <Input
              id="toAddress"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="network">Network:</Label>
            <Select
              id="network"
              value={selectedNetworkId}
              onChange={(e) => setSelectedNetworkId(e.target.value)}
            >
              <option value="">Select Network</option>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </Select>
            {selectedNetworkId && (
              <p>
                <strong>Selected Network ID:</strong> {selectedNetworkId}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="currency">Token:</Label>
            <Select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {supportedTokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </Select>
          </div>

          {!isConfirming ? (
            <div>
              <Button onClick={handlePreviewTransfer} disabled={isLoading}>
                {isLoading ? "Processing..." : "Preview Transfer"}
              </Button>
            </div>
          ) : (
            <div>
              <p>
                <strong>Confirm Payment Details:</strong>
              </p>
              <p>Amount (USD): ${amount}</p>
              <p>From Account Type: {selectedType}</p>
              <p>To Address: {toAddress}</p>
              <p>
                Network:{" "}
                {
                  networks.find((network) => network.id === selectedNetworkId)
                    ?.name
                }
              </p>
              <p>Token: {currency}</p>

              <Button onClick={handleExecuteTransfer} disabled={isLoading}>
                {isLoading ? "Processing..." : "Confirm Pay"}
              </Button>
              {/* Debugging & Testing Purpose Only */}
              {executeResponse && (
                <div>
                  <h3>Confirm Pay Response</h3>
                  <pre>{JSON.stringify(executeResponse, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {paymentStatus && (
            <PaymentStatus status={paymentStatus}>
              Payment Status: {paymentStatus}
            </PaymentStatus>
          )}
          {error && <ErrorModal message={error} onClose={closeModal} />}
          {successMessage && (
            <SuccessModal
              message={successMessage}
              onClose={closeSuccessModal}
            />
          )}
        </FormColumn>
        <FormColumn flexvalue={1}>
          <ImageContainer>
            <ShoeImage src="/shoe-image.webp" alt="Shoes" />
            <DescriptionText>
              <strong>Price:</strong> $50
            </DescriptionText>
            <DescriptionText>
              <strong>Description:</strong> A pair of stylish shoes.
            </DescriptionText>
          </ImageContainer>
          <div>
            {/* Debugging & Testing Purpose Only */}
            {previewResponse && (
              <div>
                <h3>Preview Transfer Response</h3>
                <pre>{JSON.stringify(previewResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </FormColumn>
      </FormContainer>
    </Section>
  );
};

export default PaymentFlow;
