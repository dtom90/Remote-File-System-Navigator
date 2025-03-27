import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [directories, setDirectories] = useState<string[]>([])

  useEffect(() => {
    // Fetch directories
    fetch('http://localhost:8080/api/files')
      .then(response => response.json())
      .then(data => setDirectories(data))
      .catch(error => console.error('Error fetching directories:', error))
  }, [])

  return (
    <div className="App">
      <h1>File System Navigation</h1>
      <div className="card">
        <p>Current Path: /</p>
        
        <h2>Directories</h2>
        <ul>
          {directories.map((dir, index) => (
            <li key={index}>{dir.name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
