import { createBrowserRouter, RouterProvider, Navigate, Link, Outlet } from 'react-router-dom';
import './App.css';
import LoginForm from './components/LoginForm';
import { useAuth } from './contexts/AuthContext';
import ServerList from './components/ServerList';
import ServerDetail from './components/ServerDetail';

function Layout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className='App'>
      <nav className='navbar'>
        <div className='navbar-brand'>
          <Link to='/'>Remote File Navigator</Link>
        </div>
        <div className='navbar-links'>
          {isAuthenticated && <button onClick={logout}>Logout</button>}
        </div>
      </nav>

      <Outlet />
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: '/login',
          element: !isAuthenticated ? <LoginForm /> : <Navigate to='/' />,
        },
        {
          path: '/',
          element: isAuthenticated ? <ServerList /> : <Navigate to='/login' />,
        },
        {
          path: '/servers/:id',
          element: isAuthenticated ? <ServerDetail /> : <Navigate to='/login' />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
