import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 
  
  const [loading, setLoading] = useState(false);
  // Hum abhi bhi role toggle rakh rahe hain for better UI, par redirection REAL data se hoga
  const [viewMode, setViewMode] = useState('consumer'); 
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const response = await API.post('/auth/login', formData);

      if (response.data && response.data.success) {
        const { user, token } = response.data;
        
        // Context update (isProvider aur role mapping context ke andar handle ho jayegi)
        if (login) {
          await login(user, token);
        }

        // --- UPDATED REDIRECTION LOGIC ---
        // 1. Agar user Provider dashboard dekhna chahta hai aur wo sach mein provider hai
        if (viewMode === 'provider' && user.isProvider) {
          navigate('/provider-dashboard');
        } 
        // 2. Agar user sirf consumer dashboard par jana chahta hai
        else if (viewMode === 'consumer') {
          navigate('/dashboard');
        }
        // 3. Fail-safe: Agar kuch samajh na aaye toh role ke base par redirect karo
        else {
          user.role === 'provider' ? navigate('/provider-dashboard') : navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Invalid credentials! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { backgroundColor: '#020617', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    container: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    card: { backgroundColor: '#111827', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '450px', border: '1px solid #1f2937' },
    title: { color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '8px', textAlign: 'center' },
    subtitle: { color: '#94a3b8', marginBottom: '32px', textAlign: 'center' },
    toggleContainer: { display: 'flex', backgroundColor: '#1f2937', padding: '5px', borderRadius: '12px', marginBottom: '25px' },
    toggleBtn: (active) => ({
      flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.3s',
      backgroundColor: active ? '#6366f1' : 'transparent',
      color: active ? 'white' : '#94a3b8',
    }),
    label: { color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px 16px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: 'white', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' },
    button: { width: '100%', padding: '14px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' },
    footer: { color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' },
    link: { color: '#6366f1', textDecoration: 'none', fontWeight: '600' }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Login</h2>
          <p style={styles.subtitle}>Welcome back!</p>

          <div style={styles.toggleContainer}>
            <button 
              type="button" 
              onClick={() => setViewMode('consumer')} 
              style={styles.toggleBtn(viewMode === 'consumer')}
            >
              Consumer
            </button>
            <button 
              type="button" 
              onClick={() => setViewMode('provider')} 
              style={styles.toggleBtn(viewMode === 'provider')}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" required placeholder="Email" style={styles.input} 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <label style={styles.label}>Password</label>
            <input 
              type="password" required placeholder="Password" style={styles.input} 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button 
              type="submit" 
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Processing..." : `Sign In as ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`}
            </button>
          </form>

          <div style={styles.footer}>
            New here? <Link to="/register" style={styles.link}>Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;