import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState<string>('Loading...')

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then(response => response.json())
      .then(data => setHealth(data.status))
      .catch(error => setHealth('Error: ' + error.message))
  }, [])

  return (
    <div className="App">
      <h1>File System Navigation</h1>
      <div className="card">
        <p>Backend Health Status: {health}</p>
      </div>
    </div>
  )
}

export default App
