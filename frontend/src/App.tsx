import { useState, useEffect } from 'react'
import './App.css'

interface FileInfo {
  name: string;
  size: number;
  isDir: boolean;
  modTime: string;
}

function App() {
  const [directories, setDirectories] = useState<FileInfo[]>([])
  const [currentPath, setCurrentPath] = useState<string>('/')

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

  useEffect(() => {
    fetch('http://localhost:8080/api/files/' + currentPath)
      .then(response => response.json())
      .then(data => setDirectories(data))
      .catch(error => console.error('Error fetching directories:', error))
  }, [currentPath])

  return (
    <div className="App">
      <h1>File System Navigation</h1>
      <div className="card">
        <p>Current Path: {currentPath}</p>
        
        <h2>Directories</h2>
        <button style={{ width: '100%' }} onClick={() => navigate('..')}>..</button>
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
