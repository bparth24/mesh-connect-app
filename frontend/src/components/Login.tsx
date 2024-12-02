// components/Login.tsx
import React, { useState } from 'react';
import { Section, Title, Input, Button } from './StyledComponents';

const Login: React.FC<{ onLogin: (username: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    onLogin(username);
  };

  return (
    <Section>
      <Title>Login</Title>
      <Input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      /><span> </span>
      <Button onClick={handleLogin}>Login</Button>
    </Section>
  );
};

export default Login;