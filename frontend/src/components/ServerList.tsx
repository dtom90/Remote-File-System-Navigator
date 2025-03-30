import { useState, useEffect, useCallback } from 'react';
import { Server } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function ServerList() {
  const [servers, setServers] = useState<Server[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { request } = useAuth();

  const fetchServers = useCallback(async () => {
    try {
      const response = await request('/api/servers');
      const data = await response.json();
      setServers(data);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [request]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='servers-container'>
      <h2>Available Servers</h2>
      {servers.length === 0 ? (
        <p>No servers available</p>
      ) : (
        <div className='servers-grid'>
          {servers
            .sort((a, b) => String(a.id).localeCompare(String(b.id)))
            .map((server) => (
              <Link key={server.id} to={`/servers/${server.id}`} className='btn server-tile'>
                <h3>{server.name}</h3>
                <p>{server.hostname}</p>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

export default ServerList;
