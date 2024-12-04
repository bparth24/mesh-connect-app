import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { meshMiddlewareApiUrl } from "../utility/config";
import { IntegrationItem, IntegrationResponse } from "../types/Types";

/**
 * Interface representing the properties for the IntegrationContext.
 *
 * @property {string[]} categories - An array of category names.
 * @property {string[]} types - An array of type names.
 * @property {{ [key: string]: { [key: string]: string } }} categoryTypeMap - A mapping of categories to their respective types and descriptions.
 * @property {() => Promise<void>} fetchIntegrationData - A function to fetch integration data, returning a Promise that resolves to void.
 */
interface IntegrationContextProps {
  categories: string[];
  types: string[];
  categoryTypeMap: { [key: string]: { [key: string]: string } };
  fetchIntegrationData: () => Promise<void>;
}

const IntegrationContext = createContext<IntegrationContextProps | undefined>(
  undefined
);

interface IntegrationProviderProps {
  children: ReactNode;
}

export const IntegrationProvider: React.FC<IntegrationProviderProps> = ({
  children,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [categoryTypeMap, setCategoryTypeMap] = useState<{
    [key: string]: { [key: string]: string };
  }>({});

  /**
   * Fetches integration data from the mesh middleware API and processes it.
   *
   * This function performs the following steps:
   * 1. Sends a GET request to the mesh middleware API to retrieve integration data.
   * 2. Parses the response and extracts unique categories and types from the data.
   * 3. Creates a mapping object to store the id for each combination of category and type.
   * 4. Updates the state with the unique categories, types, and the mapping object.
   *
   * @throws Will throw an error if the fetch request fails or the response is not ok.
   */
  const fetchIntegrationData = async () => {
    try {
      const response = await fetch(`${meshMiddlewareApiUrl}/meshintegrations`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to get integration id");
      }

      const data: IntegrationResponse = await response.json();

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
    } catch (err) {
      console.error("Error fetching integration id:", err);
    }
  };

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  return (
    <IntegrationContext.Provider
      value={{ categories, types, categoryTypeMap, fetchIntegrationData }}
    >
      {children}
    </IntegrationContext.Provider>
  );
};

export const useIntegration = (): IntegrationContextProps => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error(
      "useIntegration must be used within an IntegrationProvider"
    );
  }
  return context;
};
