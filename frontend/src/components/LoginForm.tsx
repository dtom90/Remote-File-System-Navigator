import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function LoginForm() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/';
  console.log('returnTo', returnTo);

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit', 'returnTo', returnTo);
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(credentials.username, credentials.password);
      if (returnTo) {
        sessionStorage.setItem('returnTo', returnTo);
        navigate(returnTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>Login</h1>
      <div className='card'>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor='username'>Username: </label>
            <input
              id='username'
              type='text'
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor='password'>Password: </label>
            <input
              id='password'
              type='password'
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <div className='flex justify-center'>
            <button type='submit' disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default LoginForm;
