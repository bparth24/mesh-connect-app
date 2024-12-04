import React, { useState } from "react";
import { Section, Title, Input, Button } from "./StyledComponents";

/**
 * Login component that renders a login form with a username input and a login button.
 *
 * @component
 * @param {Object} props - Component props
 * @param {function} props.onLogin - Callback function to handle login action
 *
 * @example
 * // Usage example:
 * <Login onLogin={(username) => console.log(username)} />
 *
 * @returns {JSX.Element} The rendered login form component
 */
const Login: React.FC<{ onLogin: (username: string) => void }> = ({
  onLogin,
}) => {
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    onLogin(username);
  };

  return (
    <Section>
      <Title>Login</Title>
      <Input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)} // clientId -> username
        placeholder="Enter username"
      />
      <span> </span>
      <Button onClick={handleLogin}>Login</Button>
    </Section>
  );
};

export default Login;
