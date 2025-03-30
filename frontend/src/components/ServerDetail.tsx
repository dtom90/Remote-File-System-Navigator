import { useState, useEffect } from 'react';
import { Server } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import './ServerDetail.css';

function ServerDetail() {
  const { id } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { request } = useAuth();

  useEffect(() => {
    if (id) {
      fetchServerDetails();
    }
  }, [id]);

  const fetchServerDetails = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await request(`/api/servers/${id}`);
      const data = await response.json();
      setServer(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!id) return;

    setConnecting(true);
    setError(null);

    try {
      const response = await request(`/api/servers/${id}/ssh`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to connect to server');
      }
      // Handle successful connection here
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  if (!id) {
    return null;
  }

  if (loading) {
    return <div className='server-detail'>Loading...</div>;
  }

  if (error) {
    return <div className='server-detail'>Error: {error}</div>;
  }

  if (!server) {
    return <div className='server-detail'>Server not found</div>;
  }

  return (
    <div className='server-detail'>
      <div className='server-detail-header'>
        <h2>{server.name}</h2>
        <button onClick={handleConnect} disabled={connecting} className='connect-button'>
          {connecting ? 'Connecting...' : 'Connect'}
        </button>
      </div>

      <div className='server-detail-content'>
        <div className='detail-row'>
          <span className='label'>Hostname:</span>
          <span className='value'>{server.hostname}</span>
        </div>

        <div className='detail-row'>
          <span className='label'>ID:</span>
          <span className='value'>{server.id}</span>
        </div>

        <div className='detail-row'>
          <span className='label'>Port:</span>
          <span className='value'>{server.port}</span>
        </div>
      </div>
    </div>
  );
}

export default ServerDetail;
