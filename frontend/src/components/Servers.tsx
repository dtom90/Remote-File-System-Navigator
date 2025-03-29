import React from 'react';
import { Server } from '../types';

interface ServersProps {
  servers: Server[];
  onServerSelect: (server: Server) => void;
}

const Servers: React.FC<ServersProps> = ({ servers, onServerSelect }) => {
  return (
    <div className="servers-container">
      <h2>Available Servers</h2>
      {servers.length === 0 ? (
        <p>No servers available</p>
      ) : (
        <ul className="servers-list">
          {servers.map((server) => (
            <li key={server.id} onClick={() => onServerSelect(server)} className="server-item">
              <h3>{server.name}</h3>
              <p>{server.host}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Servers; 