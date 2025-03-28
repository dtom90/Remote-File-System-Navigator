import { useState } from 'react';
import { SSHConnectRequest } from '../types';

interface LoginFormProps {
  onConnect: (config: SSHConnectRequest) => void;
}

function LoginForm({ onConnect }: LoginFormProps) {
  const [config, setConfig] = useState<SSHConnectRequest>({
    hostname: 'localhost',
    port: 22,
    username: '',
    password: '',
  });

  return (
    <>
      <h1>Connect to File System</h1>
      <div className='card'>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='hostname'>Hostname: </label>
          <input
            id='hostname'
            type='text'
            value={config.hostname}
            onChange={(e) => setConfig((prev) => ({ ...prev, hostname: e.target.value }))}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='port'>Port: </label>
          <input
            id='port'
            type='number'
            value={config.port}
            onChange={(e) => setConfig((prev) => ({ ...prev, port: parseInt(e.target.value) }))}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='username'>Username: </label>
          <input
            id='username'
            type='text'
            value={config.username}
            onChange={(e) => setConfig((prev) => ({ ...prev, username: e.target.value }))}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='password'>Password: </label>
          <input
            id='password'
            type='password'
            value={config.password}
            onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>
        <button onClick={() => onConnect(config)}>Connect</button>
      </div>
    </>
  );
}

export default LoginForm;
