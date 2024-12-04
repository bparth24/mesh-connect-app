import React from "react";
import { Section, Title, Button } from "../components/StyledComponents";

interface LinkSectionProps {
  clientId: string;
  integrationId: string;
  linkToken: string | null;
  integrationPayload: any;
  handleLaunchLink: () => void;
}

const LinkSection: React.FC<LinkSectionProps> = ({
  clientId,
  integrationId,
  linkToken,
  integrationPayload,
  handleLaunchLink,
}) => {
  return (
    <Section>
      <Title>Launch Link & Connect to Coinbase</Title>
      {integrationId && (
        <div>
          <p>
            <strong>User Id: </strong> {clientId}
          </p>
          <p>
            <strong>Coinbase Integration Id: </strong>
            {integrationId}
          </p>
        </div>
      )}
      <Button onClick={handleLaunchLink}>Launch Link</Button>
      {/* Debugging & testing purpose only */}
      {/* {linkToken && (
                <p style={{ wordWrap: "break-word" }}>
                  <strong>Link Token:</strong> {linkToken}
                </p>
              )} */}
      {integrationPayload && (
        <p>
          <strong>Message: </strong>Coinbase Exchange - Connected Successfully!{" "}
          <br></br>
        </p>
        // debugging & testing purpose only
        //   <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}><strong>Message: <br></br> </strong>
        //     {JSON.stringify(integrationPayload, null, 2)}
        //   </pre>
      )}
    </Section>
  );
};

export default LinkSection;
