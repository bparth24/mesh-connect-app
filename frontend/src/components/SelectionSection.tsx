import React from "react";
import {
  Section,
  Title,
  Button,
  Label,
  Select,
  IntegrationIdDisplay,
} from "../components/StyledComponents";

interface SelectionSectionProps {
  categories: string[];
  types: string[];
  selectedCategory: string;
  selectedType: string;
  integrationId: string;
  setSelectedCategory: (category: string) => void;
  setSelectedType: (type: string) => void;
  handleSaveSelection: () => void;
}

const SelectionSection: React.FC<SelectionSectionProps> = ({
  categories,
  types,
  selectedCategory,
  selectedType,
  integrationId,
  setSelectedCategory,
  setSelectedType,
  handleSaveSelection,
}) => {
  return (
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
    </Section>
  );
};

export default SelectionSection;
