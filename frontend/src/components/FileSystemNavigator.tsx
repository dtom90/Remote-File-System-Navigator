import { useState, useEffect, useCallback } from 'react';
import { FileInfo } from '../types';
import { useAuth } from '../contexts/AuthContext';

function FileSystemNavigator() {
  const [directories, setDirectories] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('.');
  const { request } = useAuth();

  const navigate = (dirName: string) => {
    const newPath = currentPath === '/' ? currentPath + dirName : currentPath + '/' + dirName;
    setCurrentPath(newPath);
  };

  const fetchDirectories = useCallback(async () => {
    const response = await request(`/api/files`, {
      method: 'POST',
      body: JSON.stringify({ path: currentPath }),
    });
    const data = await response.json();
    const { files, path } = data;
    setDirectories(files);
    setCurrentPath(path);
  }, [currentPath, request]);

  useEffect(() => {
    fetchDirectories();
  }, [fetchDirectories]);

  return (
    <>
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
