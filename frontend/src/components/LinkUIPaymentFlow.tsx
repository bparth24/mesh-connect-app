import React, { useEffect, useState, useCallback } from "react";
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

interface Network {
  id: string;
  name: string;
  logoUrl: string;
  supportedTokens: string[];
}

interface LinkUIPaymentFlowProps {
  clientDocId: string;
  selectedType: string;
}

const LinkUIPaymentFlow: React.FC<LinkUIPaymentFlowProps> = ({
  clientDocId,
  selectedType,
}) => {
  const [username, setClientId] = useState<string>(
    localStorage.getItem("clientId") || ""
  );
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
  const [transferData, setTransferData] = useState<any | null>(null);

  useEffect(() => {
    fetchNetworks();
  }, []);

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
      console.error("Error fetching networks:", err); // Log the error
      setError((err as Error).message);
    }
  };

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
        setTransferData(transferData);
        setPaymentStatus(transferData.status);
        // TODO: set transfer data to the state.
      },
      onEvent: (event) => {
        console.log("Event:", event);
        // TODO: set event data to the state & database.
      },
    });
    meshLink.openLink(token);
  };

  // Function to handle link token payment flow
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
        <FormColumn flexValue={2}>
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
        <FormColumn flexValue={1}>
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
