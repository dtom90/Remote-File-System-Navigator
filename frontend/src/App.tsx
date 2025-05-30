import { createBrowserRouter, RouterProvider, Navigate, Link, Outlet } from 'react-router-dom';
import './App.css';
import LoginForm from './components/LoginForm';
import { useAuth } from './contexts/AuthContext';
import FileSystemNavigator from './components/FileSystemNavigator';

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
          element: !isAuthenticated ? (
            <LoginForm />
          ) : (
            <Navigate to={sessionStorage.getItem('returnTo') || '/'} replace />
          ),
        },
        {
          path: '/',
          element: isAuthenticated ? (
            <FileSystemNavigator />
          ) : (
            <Navigate to='/login' replace state={{ returnTo: '/' }} />
          ),
        },
      ],
    },
  ]);

  // Subscribe to navigation events
  router.subscribe((state) => {
    if (state.location.pathname !== '/login') {
      sessionStorage.setItem('returnTo', state.location.pathname);
    }
  });

  return <RouterProvider router={router} />;
}

export default App;
