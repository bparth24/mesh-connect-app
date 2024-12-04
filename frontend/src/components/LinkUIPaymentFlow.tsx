import React, { useEffect, useState, useCallback } from "react";
import { useNetwork } from "../context/NetworkContext";
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
  theme,
} from "./StyledComponents";
import { meshMiddlewareApiUrl } from "../utility/config";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";
import { createLink } from "@meshconnect/web-link-sdk";

interface LinkUIPaymentFlowProps {
  clientDocId: string;
  selectedType: string;
}

const LinkUIPaymentFlow: React.FC<LinkUIPaymentFlowProps> = ({
  clientDocId,
  selectedType,
}) => {
  const { networks } = useNetwork();
  const [username, setClientId] = useState<string>(
    localStorage.getItem("clientId") || ""
  );
  const [amount, setAmount] = useState<number>(50);
  const [currency, setCurrency] = useState<string>("USDC");
  const [toAddress, setToAddress] = useState<string>(
    "0x0Ff0000f0A0f0000F0F000000000ffFf00f0F0f0"
  );
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>("");
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [transferData, setTransferData] = useState<any | null>(null);

  useEffect(() => {
    if (selectedNetworkId) {
      const selectedNetwork = networks.find(
        (network) => network.id === selectedNetworkId
      );
      console.log("Selected network:", selectedNetwork); // Debugging log
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
   * Opens the Mesh Link with the provided token and sets up event handlers for various link events.
   *
   * @param {string} token - The token used to authenticate and open the Mesh Link.
   *
   * Event Handlers:
   * - `onIntegrationConnected`: Triggered when the integration is successfully connected.
   *   - @param {Object} payload - The payload containing integration details.
   *
   * - `onExit`: Triggered when the link is exited.
   *   - @param {Error} error - The error object if an error occurred.
   *   - @param {Object} summary - The summary object containing exit details.
   *
   * - `onTransferFinished`: Triggered when a transfer is finished.
   *   - @param {Object} transferData - The data object containing transfer details.
   *
   * - `onEvent`: Triggered for various events during the link session.
   *   - @param {Object} event - The event object containing event details.
   */
  const openLink = (token: string) => {
    const meshLink = createLink({
      clientId: username,
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
        setTransferData(transferData); // set transfer data to the state.
        setPaymentStatus(transferData.status);
      },
      onEvent: (event) => {
        console.log("Event:", event); // TODO: set event data to the state & database.
      },
    });
    meshLink.openLink(token);
  };

  /**
   * Handles the payment process using Link UI.
   *
   * This function creates transfer options and sends a POST request to the mesh middleware API
   * to initiate the payment process. If the request is successful, it opens the Link UI payment flow.
   *
   * @async
   * @function handlePaymentUsingLinkUI
   * @returns {Promise<void>} A promise that resolves when the payment process is complete.
   *
   * @throws {Error} Throws an error if the payment process fails.
   *
   */
  const handlePaymentUsingLinkUI = useCallback(async () => {
    const transferOptions = {
      toAddresses: [
        {
          address: toAddress,
          symbol: currency,
          networkId: selectedNetworkId,
        },
      ],
      amountInFiat: amount,
      transferType: "payment", // hardcoded for now
    };

    try {
      const response = await fetch(`${meshMiddlewareApiUrl}/linktoken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: username, // username of the user or simply the uinque id of the user not the clientDocId though.
          transferOptions,
          integrationId: localStorage.getItem("integrationId"), // Coinbase Integration Id
        }),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      const data = await response.json();
      console.log("Link UI Payment response:", data); // Debugging log
      // Open the link UI payment flow
      openLink(data.content.linkToken);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [selectedNetworkId]);

  const closeModal = () => {
    setError(null);
  };

  const closeSuccessModal = () => {
    setSuccessMessage(null);
  };

  return (
    <Section>
      <Title>Link UI Payment Flow</Title>
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
          <div>
            <Button onClick={handlePaymentUsingLinkUI}>Pay</Button>
          </div>
          <div>
            {/* Debugging & Testing Purpose Only */}
            {transferData && (
              <div>
                <h3>Transfer Finished Response</h3>
                <pre>{JSON.stringify(transferData, null, 2)}</pre>
              </div>
            )}
          </div>
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
        </FormColumn>
      </FormContainer>
    </Section>
  );
};

export default LinkUIPaymentFlow;
