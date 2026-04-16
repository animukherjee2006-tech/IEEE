import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'consumer' 
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    
    try {
      // ✅ API Call: Make sure baseURL in axios.js is correct
      const response = await API.post('/auth/register', formData);
      
      if (response.data && response.data.success) {
        const { user, token } = response.data;

        // Context update
        await login(user, token); 

        // Role-based Redirection
        if (user.role === 'provider' || user.isProvider) {
          navigate('/provider-dashboard');
        } else {
          navigate('/dashboard'); 
        }
      }
    } catch (err) {
      console.error("Registration Error:", err);
      // ✅ Fix: Handling error response correctly to avoid 'undefined' errors
      const errorMessage = err.response?.data?.message || "Something went wrong during registration!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { backgroundColor: '#020617', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    container: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    card: { backgroundColor: '#111827', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '450px', border: '1px solid #1f2937' },
    title: { color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' },
    label: { color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px 16px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: 'white', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px 16px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: 'white', marginBottom: '24px', cursor: 'pointer', outline: 'none' },
    button: { width: '100%', padding: '14px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', transition: '0.3s' }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <form style={styles.card} onSubmit={handleRegister}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Join the marketplace</p>

          {/* ✅ Fixed: Added htmlFor, id, and name for accessibility */}
          <label htmlFor="fullName" style={styles.label}>Full Name</label>
          <input 
            id="fullName"
            name="name"
            type="text" 
            required 
            placeholder="John Doe" 
            style={styles.input} 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <label htmlFor="email" style={styles.label}>Email Address</label>
          <input 
            id="email"
            name="email"
            type="email" 
            required 
            placeholder="you@example.com" 
            style={styles.input} 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <label htmlFor="password" style={styles.label}>Password</label>
          <input 
            id="password"
            name="password"
            type="password" 
            required 
            placeholder="••••••••" 
            style={styles.input} 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <label htmlFor="role" style={styles.label}>Register as</label>
          <select 
            id="role"
            name="role"
            style={styles.select} 
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="consumer">Consumer (Book Services)</option>
            <option value="provider">Provider (Offer Services)</option>
          </select>

          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}} 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{color: '#6366f1', textDecoration: 'none'}}>Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
