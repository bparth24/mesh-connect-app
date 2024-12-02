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
  theme,
} from "./StyledComponents";
import { clientId, meshMiddlewareApiUrl } from "../utility/config";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";

interface Network {
  id: string;
  name: string;
  logoUrl: string;
  supportedTokens: string[];
}

interface PaymentFlowProps {
  clientDocId: string;
  selectedType: string;
}

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
      console.log("Preview transfer response:", data); // Debugging log

      if (data.status === "ok" && data.content && data.content.previewResult) {
        setPreviewId(data.content.previewResult.previewId);
        setIsConfirming(true);
      } else {
        throw new Error("Invalid preview transfer response");
      }
    } catch (err) {
      console.error("Error previewing transfer:", err); // Log the error
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute transfer
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
      console.log("Execute transfer response:", data); // Debugging log
      setPaymentStatus(data.status);
      setSuccessMessage("Payment successful!");
    } catch (err) {
      console.error("Error executing transfer:", err); // Log the error
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // old working code
  //   const handlePayment = async () => {
  //     try {
  //       const response = await fetch(`${meshMiddlewareApiUrl}/previewtransfer`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           userId: clientDocId,
  //           fromType: selectedType,
  //           networkId: selectedNetworkId,
  //           symbol: currency,
  //           toAddress: toAddress,
  //           amountInFiat: amount,
  //           fiatCurrency: "USD",
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Payment failed");
  //       }

  //       const data = await response.json();
  //       console.log("Payment response:", data); // Debugging log
  //       setPaymentStatus(data.status);
  //       setSuccessMessage("Payment successful!");
  //     } catch (err) {
  //       console.error("Error making payment:", err); // Log the error
  //       setError((err as Error).message);
  //     }
  //   };

  // Payment flow -- Question -- Should I do with linktoken with different parameters? or transfer configure/preview/execute?
  // const handlePaymentUsingLinkUI = useCallback(async () => {
  //   try {
  //     const response = await fetch(`${meshMiddlewareApiUrl}/payment`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         amount: 50,
  //         currency: "USDC",
  //         toAddress: "0x0Ff0000f0A0f0000F0F000000000ffFf00f0F0f0",
  //         network: "Ethereum",
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Payment failed");
  //     }

  //     const data = await response.json();
  //     console.log("Payment response:", data); // Debugging log
  //     setPaymentStatus(data.status);
  //   } catch (err) {
  //     setError((err as Error).message);
  //   }
  // }, []);

  const closeModal = () => {
    setError(null);
  };

  const closeSuccessModal = () => {
    setSuccessMessage(null);
  };

  //   const handleConfirm = () => {
  //     setIsConfirming(true);
  //   };

  return (
    <Section>
      <Title>Payment Flow</Title>
      <DescriptionCard>
        <DescriptionText>
          Pay $50 in Fiat using USDC tokens from Connected Account (e.g.
          Coinbase) to the test wallet address
          '0x0Ff0000f0A0f0000F0F000000000ffFf00f0F0f0' over Ethereum Network.{" "}
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

          {!isConfirming ? (
            <Button onClick={handlePreviewTransfer} disabled={isLoading}>
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
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
                {isLoading ? "Processing..." : "Confirm and Pay"}
              </Button>
            </div>
          )}

          {/* old working code below */}
          {/* {!isConfirming ? (
            <Button onClick={handleConfirm}>Proceed to Payment</Button>
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
              <Button onClick={handlePayment}>Confirm and Pay</Button>
            </div>
          )} */}

          {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
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

export default PaymentFlow;
