import { useState, useEffect } from 'react'
import './App.css'

interface ConnectionConfig {
  hostname: string;
  port: number;
  username: string;
  password: string;
}

type SSHConnectResponse = {
  message: string;
  sessionID: string;
}

interface FileInfo {
  name: string;
  size: number;
  isDir: boolean;
  modTime: string;
}

function App() {
  const [directories, setDirectories] = useState<FileInfo[]>([])
  const [currentPath, setCurrentPath] = useState<string>('/')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [config, setConfig] = useState<ConnectionConfig>({
    hostname: 'localhost',
    port: 22,
    username: '',
    password: ''
  })

  const handleConnect = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/ssh/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          port: config.port.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to establish SSH connection');
      }

      const data = await response.json() as SSHConnectResponse;
      setSessionId(data.sessionID);
      alert(data.message);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect: ' + (error as Error).message);
    }
  }

  const navigate = (path: string) => {
    if (path === '..') {
      setCurrentPath(currentPath.slice(0, currentPath.lastIndexOf('/')))
    } else {
      const newPath = currentPath === '/' 
        ? currentPath + path 
        : currentPath + '/' + path;
    
      setCurrentPath(newPath)
    }
  }

  const handleCloseSession = () => {
    fetch(`http://localhost:8080/api/ssh/disconnect/${sessionId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert('Error closing session: ' + data.error);
      } else {
        setSessionId(null);
        alert(data.message);
      }
    })
    .catch(error => console.error('Error closing session:', error))
  }

  useEffect(() => {
    if (!sessionId) return;

    fetch(`http://localhost:8080/api/files/${sessionId}/${currentPath}`)
      .then(response => response.json())
      .then(data => setDirectories(data))
      .catch(error => console.error('Error fetching directories:', error))
  }, [currentPath, sessionId])

  if (!sessionId) {
    return (
      <div className="App">
        <h1>Connect to File System</h1>
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="hostname">Hostname: </label>
            <input
              id="hostname"
              type="text"
              value={config.hostname}
              onChange={(e) => setConfig(prev => ({ ...prev, hostname: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="port">Port: </label>
            <input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username">Username: </label>
            <input
              id="username"
              type="text"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Password: </label>
            <input
              id="password"
              type="password"
              value={config.password}
              onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <button onClick={handleConnect}>Connect</button>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <h1>File System Navigation</h1>
      <h4>Session ID: {sessionId}</h4>
      <button onClick={handleCloseSession}>Close Session</button>
      <div className="card">
        <p>Current Path: {currentPath}</p>
        
        <h2>Directories</h2>
        {directories.map((dir, index) => (
          <div key={index}>
            <button style={{ width: '100%' }} disabled={!dir.isDir} onClick={() => navigate(dir.name)}>{dir.name}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
