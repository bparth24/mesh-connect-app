import styled from "styled-components";

export const theme = {
  colors: {
    primary: "#3498db",
    background: "#f8f9fa",
    white: "#ffffff",
    text: "#2c3e50",
    error: "#e74c3c",
    border: "#ddd",
  },
  spacing: {
    sm: "10px",
    md: "20px",
    lg: "30px",
    xl: "40px",
  },
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease",
};

export const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${theme.colors.background};
  min-height: "100vh";
`;

export const Section = styled.section`
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
  margin-bottom: ${theme.spacing.lg};
`;

export const Title = styled.h2`
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`;

export const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: 10px 20px;
  border: none;
  border-radius: ${theme.borderRadius};
  cursor: pointer;
  transition: ${theme.transition};
  font-weight: 500;

  &:hover {
    background-color: #2980b9;
  }
`;

export const Input = styled.input`
  width: 50%;
  padding: 8px 12px;
  border-radius: ${theme.borderRadius};
  border: 1px solid ${theme.colors.border};
  transition: ${theme.transition};
  margin-bottom: ${theme.spacing.md}; /* Add margin-bottom to create space */

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

export const CopyButton = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: 5px 10px;
  border: none;
  border-radius: ${theme.borderRadius};
  cursor: pointer;
  transition: ${theme.transition};
  font-weight: 500;
  margin-left: ${theme.spacing.sm};

  &:hover {
    background-color: #2980b9;
  }
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md}; /* Add gap between input and button */
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${theme.spacing.md};
`;

export const Th = styled.th`
  border: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
`;

export const Td = styled.td`
  border: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.sm};
  text-align: center;
`;

export const Tr = styled.tr`
  &:nth-child(even) {
    background-color: ${theme.colors.background};
  }
`;
export const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  font-weight: 500;
  color: ${theme.colors.text};
`;

export const Select = styled.select`
  width: 25%;
  padding: 8px 12px;
  border-radius: ${theme.borderRadius};
  border: 1px solid ${theme.colors.border};
  transition: ${theme.transition};
  margin-bottom: ${theme.spacing.md};

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

export const IntegrationIdDisplay = styled.div`
  margin-bottom: ${theme.spacing.md};
  font-weight: 500;
  color: ${theme.colors.text};
`;

export const DescriptionCard = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-top: 20px;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const DescriptionTitle = styled.h3`
  margin-top: 0;
  font-size: 1.2em;
  color: #333;
`;

export const DescriptionText = styled.p`
  margin: 8px 0;
  font-size: 1em;
  color: #555;
`;

export const ImageContainer = styled.div`
  flex: 1;
  text-align: center;
`;

export const ShoeImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px; /* Add space between the image and the description card */
`;

export const FormContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

export const FormColumn = styled.div<{ flexValue?: number }>`
  flex: ${(props) => props.flexValue || 1};
  margin-right: 20px;

  &:last-child {
    margin-right: 0;
  }
`;

export const PaymentStatus = styled.p<{ status: string | null }>`
  color: ${(props) =>
    props.status === "succeeded" || props.status === "success"
      ? "green"
      : "red"};
`;
