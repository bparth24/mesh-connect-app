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
  Label,
  Select,
  IntegrationIdDisplay,
  theme
} from '../components/StyledComponents'
import { meshMiddlewareApiUrl, clientId } from '../utility/config'
import { createLink } from '@meshconnect/web-link-sdk'
import { IntegrationItem, IntegrationResponse, IntegrationPayload } from '../types/Types'
import ErrorModal from '../components/ErrorModal';
import SuccessModal from '../components/SuccessModal'

export const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [integrationId, setIntegrationId] = useState<string | null>(null)
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [portfolio, setPortfolio] = useState<any | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<boolean>(false)
  const [inputIntegrationId, setInputIntegrationId] = useState<string>('')
  const [integrationPayload, setIntegrationPayload] = useState<any | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [categoryTypeMap, setCategoryTypeMap] = useState<{ [key: string]: { [key: string]: string } }>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


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

    // Make API call to get integration IDs on page load -- TODO: Update the function name
    handleGetIntegrationId()
  }, [])

  const handleGetIntegrationId = useCallback(async () => {
    try {
        // Reset copy status when fetching a new integration id
        // setCopyStatus(false)

        console.log('Request URL:', `${meshMiddlewareApiUrl}/meshintegrations`) // Debugging log
        const response = await fetch(`${meshMiddlewareApiUrl}/meshintegrations`, {
            method: 'GET'
        })

        if (!response.ok) {
            throw new Error('Failed to get integration id')
        }

        const data = await response.json()
        console.log('Integration ID response:', data) // Debugging log

        // Extract unique categories and types
        const uniqueCategories: string[] = Array.from(new Set(data.content.items.flatMap((item: IntegrationItem) => item.categories)))
        const uniqueTypes: string[] = Array.from(new Set(data.content.items.map((item: IntegrationItem) => item.type)))

        // Create a mapping object to store the id for each combination of category and type
        const map: { [key: string]: { [key: string]: string } } = {}
        data.content.items.forEach((item: IntegrationItem) => {
            item.categories.forEach((category: string) => {
            if (!map[category]) {
                map[category] = {}
            }
            map[category][item.type] = item.id
            })
        })

        setCategories(uniqueCategories)
        setTypes(uniqueTypes)
        setCategoryTypeMap(map)

        // setIntegrationId(data.integrationId)
        } catch (err) {
            console.error('Error fetching integration id:', err) // Log the error
            setError((err as Error).message)
        }
    }, [])

    // Save the selected category, type and integration id to the database for future reference
    const handleSaveSelection = async () => {
    try {
      const selectedIntegration = {
        _id: `${clientId}_${selectedCategory}_${selectedType}`,
        clientId: clientId,
        integrationId: integrationId,
        category: selectedCategory,
        type: selectedType
      }

      const response = await fetch(`${meshMiddlewareApiUrl}/db/save-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedIntegration)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json()
      console.log('Save selection response:', data) // Debugging log
      setSuccessMessage(`Selection saved successfully with data: ${JSON.stringify(selectedIntegration, null, 2)}`);
    } catch (err) {
      console.error('Error saving selection:', err) // Log the error
      setError((err as Error).message)
    }
  }

  const handleLaunchLink = useCallback(async () => {
    const idToUse = inputIntegrationId || integrationId // TODO: Remove inputIntegrationId and use integrationId only
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
        // Save linkToken in PouchDB -- leaving it here tonight -- start fron here tomorrow


        localStorage.setItem('linkToken', data.content.linkToken) // Store linkToken in local storage
        openLink(data.content.linkToken) // Logic to connect to Coinbase account using the link token

        // // Update the document with link token and integration payload data.
        // await updateDocWithData(`${clientId}_${selectedCategory}_${selectedType}`, data.content.linkToken, integrationPayload)

        } catch (err) {
            setError((err as Error).message)
        }
    }, [inputIntegrationId, integrationId])


    // update to db function
    const updateDocWithData = async (id: string, linkToken: string, integrationPayload: IntegrationPayload) => {
        // Error handling before accessing variables
        if (!integrationPayload || !integrationPayload.accessToken || !integrationPayload.accessToken.accountTokens || !integrationPayload.accessToken.accountTokens[0]) {
            throw new Error('Invalid integration payload structure');
        }

        const accessToken = integrationPayload.accessToken.accountTokens[0].accessToken;
        
        try {
            const response = await fetch(`${meshMiddlewareApiUrl}/db/update-doc`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: id, linkToken, accessToken, integrationPayload })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();
            console.log('Update document response:', data); // Debugging log
            setSuccessMessage(`Database updated with data: ${JSON.stringify({ data }, null, 2)}`);
            } catch (err) {
                console.error('Error updating document:', err); // Log the error
                setError((err as Error).message);
            }
        }


   const openLink = (token: string) => {
    const meshLink = createLink({
      clientId: clientId, 
      onIntegrationConnected: (payload) => {
        console.log('Integration connected:', payload)
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
        if (event.type === 'integrationConnected') {
          const payload = event.payload as IntegrationPayload;
          setIntegrationPayload(payload); // Set the integration payload state
          // Update the document with link token and integration payload data.
          updateDocWithData(`${clientId}_${selectedCategory}_${selectedType}`, token, payload);
          console.log('Updated Doc with integration payload:', payload);
        }
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

    useEffect(() => {
    if (selectedCategory && selectedType) {
      const id = categoryTypeMap[selectedCategory]?.[selectedType] || null
      setIntegrationId(id)
    }
  }, [selectedCategory, selectedType, categoryTypeMap]);

  const closeModal = () => {
    setError(null);
  };

  const closeSuccessModal = () => {
    setSuccessMessage(null);
  };

  return (
    <Container>
        <Section>
            <Title>Mesh Connect App Functionality</Title>
            <p><strong>User ID: </strong> {clientId} </p>
        </Section>
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

        {/* Below Old Logic */}

        {/* <Button onClick={handleGetIntegrationId}>Get Integration Id</Button>
        {integrationId && (
          <div>
            <p><strong>User Id: </strong> {clientId}</p>
            <p><strong>Coinbase Integration Id: </strong>{integrationId}</p>
            <CopyButton onClick={() => handleCopy(integrationId)}>
              {copyStatus ? 'Copied!' : 'Copy'}
            </CopyButton>
          </div>
        )} */}
      </Section>

      <Section>
        <Title>Launch Link & Connect to Coinbase</Title>
        { integrationId && (
          <div>
            <p><strong>User Id: </strong> {clientId}</p>
            <p><strong>Coinbase Integration Id: </strong>{integrationId}</p>
          </div>
        )}
        <Button onClick={handleLaunchLink}>Launch Link</Button>
        {/* <InputWrapper>
             <Input
                value={inputIntegrationId}
                onChange={(e) => setInputIntegrationId(e.target.value)}
                placeholder="Paste Coinbase Integration Id here"
            /> 
        </InputWrapper> */}
        {/* <p><strong>Note:</strong> User Id is passed in the body.</p> */}
        {linkToken && (
          <p style={{ wordWrap: 'break-word' }}><strong>Link Token:</strong> {linkToken}</p>
        )}
        {integrationPayload && (
            <p><strong>Message: </strong>Coinbase Exchange - Connected Successfully! <br></br></p>
            // debugging purposes
            //   <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}><strong>Message: <br></br> </strong>  
            //     {JSON.stringify(integrationPayload, null, 2)}
            //   </pre>
        )}
      </Section>

      <Section>
        <Title>Coinbase Portfolio</Title>
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

      {/* {error && (
        <Section style={{ backgroundColor: '#fff3f3' }}>
          <p style={{ color: theme.colors.error }}>{error}</p>
        </Section>
      )} */}

      {error && <ErrorModal message={error} onClose={closeModal} />}
      {successMessage && <SuccessModal message={successMessage} onClose={closeSuccessModal} />}
    </Container>
  )
}

export default App