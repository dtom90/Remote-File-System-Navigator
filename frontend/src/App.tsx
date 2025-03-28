import { useState } from 'react';
import './App.css';
import Notification from './components/Notification';
import LoginForm from './components/LoginForm';
import FileSystemNavigator from './components/FileSystemNavigator';
import { SSHConnectResponse, SSHDisconnectResponse, SSHConnectRequest } from './types';

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleConnect = async (isConnected: boolean) => {
    if (isConnected) {
      // call the api to get the servers
      const response = await fetch('http://localhost:8080/api/servers');
      const data = await response.json();
      console.log(data);
    }
  };
  // const handleConnect = async (config: SSHConnectRequest) => {
  //   try {
  //     const response = await fetch('http://localhost:8080/api/ssh/connect', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         ...config,
  //         port: config.port.toString(),
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to establish SSH connection');
  //     }

  //     const data = (await response.json()) as SSHConnectResponse;
  //     setSessionId(data.sessionID);
  //     setNotification({ message: data.message, type: 'success' });
  //   } catch (error) {
  //     console.error('Connection error:', error);
  //     setNotification({ message: 'Failed to connect: ' + (error as Error).message, type: 'error' });
  //   }
  // };

  const handleCloseSession = async () => {
    if (!sessionId) {
      setNotification({ message: 'No session to close', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/ssh/disconnect/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect SSH session');
      }

      const data = (await response.json()) as SSHDisconnectResponse;
      setSessionId(null);
      setNotification({ message: data.message, type: 'success' });
    } catch (error) {
      console.error('Error closing session:', error);
      setNotification({
        message: 'Error closing session: ' + (error as Error).message,
        type: 'error',
      });
    }
  };

  return (
    <div className='App'>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={5000}
        />
      )}

      {!sessionId ? (
        <LoginForm onConnect={handleConnect} />
      ) : (
        <FileSystemNavigator sessionId={sessionId} onCloseSession={handleCloseSession} />
      )}
    </div>
  );
}

export default App;
