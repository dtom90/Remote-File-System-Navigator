import { useState } from 'react';
import './App.css';
import Notification from './components/Notification';
import LoginForm from './components/LoginForm';
import { Server, SSHDisconnectResponse } from './types';
import { useAuth } from './contexts/AuthContext';
import Servers from './components/Servers';

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const { token } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);

  const handleConnect = async (isConnected: boolean) => {
    if (!isConnected) return;
    
    if (!token) {
      setNotification({ message: 'Not authenticated. Please login first.', type: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/servers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch servers');
      }
      
      const data = await response.json();
      setServers(data);
    } catch (error) {
      setNotification({ 
        message: 'Failed to fetch servers: ' + (error as Error).message, 
        type: 'error' 
      });
    }
  };

  const handleServerSelect = (server: Server) => {
    console.log('Selected server:', server);
  };

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

      {!servers.length ? (
        <LoginForm onConnect={handleConnect} />
      ) : (
        <Servers servers={servers} onServerSelect={handleServerSelect} />
      )}
    </div>
  );
}

export default App;
