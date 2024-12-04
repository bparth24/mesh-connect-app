import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { meshMiddlewareApiUrl } from "../utility/config";

/**
 * Represents a network in the application - PaymentFlow & LinkUIPaymentFlow Components.
 *
 * @interface Network
 * @property {string} id - The unique identifier for the network.
 * @property {string} name - The name of the network.
 * @property {string} logoUrl - The URL to the network's logo image.
 * @property {string[]} supportedTokens - An array of token identifiers that are supported by the network.
 */
interface Network {
  id: string;
  name: string;
  logoUrl: string;
  supportedTokens: string[];
}

/**
 * Interface representing the properties for the NetworkContext.
 */
interface NetworkContextProps {
  networks: Network[];
  fetchNetworks: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextProps | undefined>(
  undefined
);

interface NetworkProviderProps {
  children: ReactNode;
}

/**
 * NetworkProvider component that provides network data and fetch functionality to its children.
 *
 * @param {NetworkProviderProps} props - The properties for the NetworkProvider component.
 * @param {React.ReactNode} props.children - The child components that will have access to the network context.
 *
 * @returns {JSX.Element} The NetworkProvider component.
 *
 * @remarks
 * This component fetches network data from the mesh middleware API and provides it to its children
 * through the NetworkContext. It also provides a function to refetch the network data.
 *
 */
export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [networks, setNetworks] = useState<Network[]>([]);

  /**
   * Fetches the list of networks from the mesh middleware API.
   *
   * This function sends a GET request to the mesh middleware API to retrieve
   * the list of mesh networks. If the request is successful, it updates the
   * state with the fetched networks. If the request fails, it logs an error
   * message to the console.
   *
   * @async
   * @function fetchNetworks
   * @throws {Error} Throws an error if the network request fails.
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
    } catch (err) {
      console.error("Error fetching networks:", err);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  return (
    <NetworkContext.Provider value={{ networks, fetchNetworks }}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * Custom hook to access the NetworkContext.
 *
 * This hook provides the context value of NetworkContext. It must be used within a NetworkProvider.
 *
 * @returns {NetworkContextProps} The context value of NetworkContext.
 * @throws {Error} If the hook is used outside of a NetworkProvider.
 */
export const useNetwork = (): NetworkContextProps => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
