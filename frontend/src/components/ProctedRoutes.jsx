import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Loading...</div>;

  if (!user) {
    // Agar user login nahi hai toh login page par bhej do
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- ROLE BASED NAVIGATION LOGIC ---
  const path = location.pathname;

  // Agar Consumer Provider Dashboard pe jaane ki koshish kare
  if (user === 'consumer' && path.includes('provider')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Agar Provider Consumer Dashboard pe jaane ki koshish kare
  if (user=== 'provider' && path === '/dashboard') {
    return <Navigate to="/provider-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;