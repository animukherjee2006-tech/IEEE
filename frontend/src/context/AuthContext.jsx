import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to format user data (Role Mapping)
  const formatUserData = (userData) => {
    return {
      ...userData,
      // Backend se agar 'user' role aaye toh use 'consumer' ki tarah treat karo
      role: userData.role === 'user' ? 'consumer' : userData.role,
      isProvider: userData.isProvider || false
    };
  };

  // 1. LOGIN FUNCTION
  const login = async (userData, token) => {
    const formattedUser = formatUserData(userData);
    
    setUser(formattedUser);
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(formattedUser));
    
    // Axios header update for immediate requests
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // 2. LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    delete API.defaults.headers.common['Authorization'];
    
    // Soft redirect to login (avoiding full page reload if possible)
    window.location.href = '/login';
  };

  // 3. CHECK USER SESSION (On Page Refresh)
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Axios global header set for current session
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const res = await API.get('/auth/me'); 
        
        if (res.data.success) {
          setUser(formatUserData(res.data.user));
        }
      } catch (err) {
        console.error("Auth sync failed:", err.message);
        // Token expire ya invalid hone par cleanup
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {!loading && children} 
      {/* {!loading && children} ensure karta hai ki jab tak auth check na ho, app render na ho */}
    </AuthContext.Provider>
  );
};