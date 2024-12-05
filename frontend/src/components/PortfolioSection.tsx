import React from "react";
import {
  Section,
  Title,
  Button,
  Table,
  Th,
  Td,
  Tr,
} from "../components/StyledComponents";

interface PortfolioSectionProps {
  portfolio: any;
  aggregatedPortfolio: any;
  handleFetchPortfolio: () => void;
  handleFetchAggregatedPortfolio: () => void;
}

/**
 * PortfolioSection component displays the Coinbase holdings and aggregated portfolio information.
 *
 * @component
 * @param {PortfolioSectionProps} props - The properties for the PortfolioSection component.
 * @param {object} props.portfolio - The portfolio data containing cryptocurrency positions.
 * @param {object} props.aggregatedPortfolio - The aggregated portfolio data containing overall portfolio performance.
 * @param {function} props.handleFetchPortfolio - Function to fetch the portfolio data.
 * @param {function} props.handleFetchAggregatedPortfolio - Function to fetch the aggregated portfolio data.
 *
 */
const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  portfolio,
  aggregatedPortfolio,
  handleFetchPortfolio,
  handleFetchAggregatedPortfolio,
}) => {
  return (
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

          {/* Debugging & testing purpose only */}
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
          {/* Debugging & testing purpose only */}
          {/* <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {JSON.stringify(aggregatedPortfolio, null, 2)}
            </pre> */}
        </div>
      )}
    </Section>
  );
};

export default PortfolioSection;
