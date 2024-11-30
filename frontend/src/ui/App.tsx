import React, { useState, useCallback, useEffect } from 'react'
import {
  Container,
  Section,
  Title,
  Button,
  Input,
  CopyButton,
  InputWrapper,
  Table,
  Th,
  Td,
  Tr,
  theme
} from '../components/StyledComponents'
import { meshMiddlewareApiUrl, clientId } from '../utility/config'
import { createLink } from '@meshconnect/web-link-sdk'

export const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [integrationId, setIntegrationId] = useState<string | null>(null)
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [portfolio, setPortfolio] = useState<any | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<boolean>(false)
  const [inputIntegrationId, setInputIntegrationId] = useState<string>('')
  const [integrationPayload, setIntegrationPayload] = useState<any | null>(null)


  useEffect(() => {
    // Clear linkToken on component mount (page refresh)
    localStorage.removeItem('linkToken')
    setLinkToken(null)

    // Reset copy status on component mount (page refresh)
    setCopyStatus(false)

    // Retrieve linkToken from local storage if available
    const storedLinkToken = localStorage.getItem('linkToken')
    if (storedLinkToken) {
      setLinkToken(storedLinkToken)
      openLink(storedLinkToken)
    }
  }, [])

  const handleGetIntegrationId = useCallback(async () => {
    try {
        // Reset copy status when fetching a new integration id
        setCopyStatus(false)

        console.log('Request URL:', `${meshMiddlewareApiUrl}/meshintegrations`) // Debugging log
        const response = await fetch(`${meshMiddlewareApiUrl}/meshintegrations`, {
            method: 'GET'
        })

        if (!response.ok) {
            throw new Error('Failed to get integration id')
        }

        const data = await response.json()
        console.log('Integration ID response:', data) // Debugging log

        setIntegrationId(data.integrationId)
        } catch (err) {
            console.error('Error fetching integration id:', err) // Log the error
            setError((err as Error).message)
        }
    }, [])

  const handleLaunchLink = useCallback(async () => {
    const idToUse = inputIntegrationId || integrationId
    if (!idToUse) {
      setError('Please get or enter the integration id first')
      return
    }

    try {
        console.log('Request URL:', `${meshMiddlewareApiUrl}/linktoken`) // Debugging log
        const response = await fetch(`${meshMiddlewareApiUrl}/linktoken`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userId": clientId, "integrationId": idToUse })
        })

        if (!response.ok) {
            throw new Error('Failed to get link token')
        }

        const data = await response.json()
        console.log('Link Token response:', data) // Debugging log
        setLinkToken(data.content.linkToken)
        localStorage.setItem('linkToken', data.content.linkToken) // Store linkToken in local storage
        openLink(data.content.linkToken)
        // Logic to connect to Coinbase account using the link token
        } catch (err) {
            setError((err as Error).message)
        }
    }, [inputIntegrationId, integrationId])

   const openLink = (token: string) => {
    const meshLink = createLink({
      clientId: clientId, 
      onIntegrationConnected: (payload) => {
        console.log('Integration connected:', payload)
        setIntegrationPayload(payload) // Set the integration payload state
      },
      onExit: (error, summary) => {
        if (error) {
          console.error('Error:', error)
        }
        if (summary) {
          console.log('Summary:', summary)
        }
      },
      onTransferFinished: (transferData) => {
        console.log('Transfer finished:', transferData)
      },
      onEvent: (event) => {
        console.log('Event:', event)
      }
    })
    meshLink.openLink(token)
  }

  const handleFetchPortfolio = useCallback(async () => {
    try {
        // TODO: Remove hardcoded authToken and type & handle it on the mesh-middleware side
        //TODO: Handle refresh token logic
      const response = await fetch(`${meshMiddlewareApiUrl}/holdings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "authToken": "xxx", "type": "coinbase" })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio')
      }

      const data = await response.json()
      console.log('Portfolio response:', data) // Debugging log
      setPortfolio(data)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  // Payment flow -- Question -- Should I do with linktoken with different parameters? or transfer configure/preview/execute?
  const handlePayment = useCallback(async () => {
    try {
      const response = await fetch(`${meshMiddlewareApiUrl}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 50,
          currency: 'USDC',
          toAddress: '0x0Ff0000f0A0f0000F0F000000000ffFf00f0F0f0',
          network: 'Ethereum'
        })
      })

      if (!response.ok) {
        throw new Error('Payment failed')
      }

      const data = await response.json()
      console.log('Payment response:', data) // Debugging log
      setPaymentStatus(data.status)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(true)
    //setTimeout(() => setCopyStatus(false), 2000) // Reset copy status after 2 seconds
  }

  return (
    <Container>
      <Section>
        <Title>Get Coinbase Integration Id</Title>
        <Button onClick={handleGetIntegrationId}>Get Integration Id</Button>
        {integrationId && (
          <div>
            <p><strong>User Id: </strong> {clientId}</p>
            <p><strong>Coinbase Integration Id: </strong>{integrationId}</p>
            <CopyButton onClick={() => handleCopy(integrationId)}>
              {copyStatus ? 'Copied!' : 'Copy'}
            </CopyButton>
          </div>
        )}
      </Section>

      <Section>
        <Title>Launch Link & Connect to Coinbase</Title>
        <InputWrapper>
            <Input
                value={inputIntegrationId}
                onChange={(e) => setInputIntegrationId(e.target.value)}
                placeholder="Paste Coinbase Integration Id here"
            />
            <Button onClick={handleLaunchLink}>Launch Link</Button>
        </InputWrapper>
        <p><strong>Note:</strong> User Id is passed in the body.</p>
        {linkToken && (
          <p style={{ wordWrap: 'break-word' }}><strong>Link Token:</strong> {linkToken}</p>
        )}
        {integrationPayload && (
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}><strong>Integration Payload JSON <br></br> </strong>
            {JSON.stringify(integrationPayload, null, 2)}
          </pre>
        )}
      </Section>

      <Section>
        <Title>Coinbase Portfolio </Title>
        <Button onClick={handleFetchPortfolio}>Fetch Portfolio</Button>
        {portfolio && (
           <div>
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
                {portfolio.content.cryptocurrencyPositions.map((item: any, index: number) => (
                  <Tr key={index}>
                    <Td>{item.name}</Td>
                    <Td>{item.symbol}</Td>
                    <Td>{item.amount}</Td>
                    <Td>${item.costBasis}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}><strong>Coinbase Portfolio JSON:<br></br> </strong>
              {JSON.stringify(portfolio, null, 2)}
            </pre>
          </div>
        )}
      </Section>

      <Section>
        <Title>Payment Flow</Title>
        <Button onClick={handlePayment}>Pay $50 for Shoes</Button>
        {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
      </Section>

      {error && (
        <Section style={{ backgroundColor: '#fff3f3' }}>
          <p style={{ color: theme.colors.error }}>{error}</p>
        </Section>
      )}
    </Container>
  )
}

export default App