import { useState, useEffect, useCallback } from 'react';
import { FileInfo } from '../types';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function FileSystemNavigator() {
  const [directories, setDirectories] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('.');
  const serverId = useParams().id;
  const { request } = useAuth();

  const navigate = (path: string) => {
    if (path === '..') {
      setCurrentPath(currentPath.slice(0, currentPath.lastIndexOf('/')));
    } else {
      const newPath = currentPath === '/' ? currentPath + path : currentPath + '/' + path;
      setCurrentPath(newPath);
    }
  };

  const fetchDirectories = useCallback(async () => {
    const response = await request(`/api/servers/${serverId}/files`, {
      method: 'POST',
      body: JSON.stringify({ path: currentPath }),
    });
    const data = await response.json();
    setDirectories(data);
  }, [serverId, currentPath, request]);

  useEffect(() => {
    fetchDirectories();
  }, [fetchDirectories]);

  return (
    <>
      {/* <h2>{server.name}</h2> */}
      <h2>server.name</h2>
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
