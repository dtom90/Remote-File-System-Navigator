import { useState, useEffect } from 'react';
import { Server } from '../types';
import { useAuth } from '../contexts/AuthContext';

function Servers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { request } = useAuth();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await request('/api/servers');
      const data = await response.json();
      setServers(data);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleServerSelect = (server: Server) => {
    console.log('Selected server:', server);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="servers-container">
      <h2>Available Servers</h2>
      {servers.length === 0 ? (
        <p>No servers available</p>
      ) : (
        <ul className="servers-list">
          {servers.map((server) => (
            <li key={server.id} onClick={() => handleServerSelect(server)} className="server-item">
              <h3>{server.name}</h3>
              <p>{server.host}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Servers;
