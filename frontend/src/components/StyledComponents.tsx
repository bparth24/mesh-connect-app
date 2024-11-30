import styled from 'styled-components'

export const theme = {
  colors: {
    primary: '#3498db',
    background: '#f8f9fa',
    white: '#ffffff',
    text: '#2c3e50',
    error: '#e74c3c',
    border: '#ddd'
  },
  spacing: {
    sm: '10px',
    md: '20px',
    lg: '30px',
    xl: '40px'
  },
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease'
}

export const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1000px;
  margin: 0 auto;
  background-color: ${theme.colors.background};
  min-height: '100vh';
`

export const Section = styled.section`
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
  margin-bottom: ${theme.spacing.lg};
`

export const Title = styled.h2`
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`

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
`

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: ${theme.borderRadius};
  border: 1px solid ${theme.colors.border};
  transition: ${theme.transition};
  margin-bottom: ${theme.spacing.md}; /* Add margin-bottom to create space */

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`

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
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md}; /* Add gap between input and button */
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${theme.spacing.md};
`

export const Th = styled.th`
  border: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
`

export const Td = styled.td`
  border: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.sm};
  text-align: center;
`

export const Tr = styled.tr`
  &:nth-child(even) {
    background-color: ${theme.colors.background};
  }
`