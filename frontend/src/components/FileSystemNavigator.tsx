import { useState, useEffect } from 'react';
import { FileInfo } from '../types';

interface FileSystemNavigatorProps {
  sessionId: string;
  onCloseSession: () => void;
}

function FileSystemNavigator({ sessionId, onCloseSession }: FileSystemNavigatorProps) {
  const [directories, setDirectories] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');

  const navigate = (path: string) => {
    if (path === '..') {
      setCurrentPath(currentPath.slice(0, currentPath.lastIndexOf('/')));
    } else {
      const newPath = currentPath === '/' ? currentPath + path : currentPath + '/' + path;
      setCurrentPath(newPath);
    }
  };

  useEffect(() => {
    fetch(`http://localhost:8080/api/files/${sessionId}/${currentPath}`)
      .then((response) => response.json())
      .then((data) => setDirectories(data))
      .catch((error) => console.error('Error fetching directories:', error));
  }, [currentPath, sessionId]);

  return (
    <>
      <h1>File System Navigation</h1>
      <h4>Session ID: {sessionId}</h4>
      <button onClick={onCloseSession}>Close Session</button>
      <div className='card'>
        <p>Current Path: {currentPath}</p>

        <h2>Directories</h2>
        {directories.map((dir, index) => (
          <div key={index}>
            <button
              style={{ width: '100%' }}
              disabled={!dir.isDir}
              onClick={() => navigate(dir.name)}
            >
              {dir.name}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default FileSystemNavigator;
