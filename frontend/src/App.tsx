import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Notification from './components/Notification';
import LoginForm from './components/LoginForm';
import { useAuth } from './contexts/AuthContext';
import Servers from './components/Servers';

function App() {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const { token, setToken } = useAuth();

  function handleLogout(): void {
    setToken(null);
  }

  return (
    <BrowserRouter>
      <div className='App'>
        <nav className="navbar">
          <div className="navbar-brand">
            <Link to="/">Remote File Navigator</Link>
          </div>
          <div className="navbar-links">
            {token && (
              <button onClick={handleLogout}>Logout</button>
            )}
          </div>
        </nav>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            duration={5000}
          />
        )}

        <Routes>
          <Route 
            path="/login" 
            element={
              !token ? (
                <LoginForm />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              token ? (
                <Servers />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
