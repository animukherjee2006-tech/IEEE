import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Layout/Navbar';

const AddService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cleaning',
    description: '',
    price: '',
    location: '',
    image: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Backend API Call
      const res = await API.post('/services/create', formData);
      
      // 2. Check if successful
      if (res.data.success || res.status === 201) {
        alert("Service launched successfully! ✨");
        
        // 3. Navigation - Ensure this matches your App.js route
        navigate('/provider-dashboard'); 
      }
    } catch (err) {
      console.error("Add Service Error:", err);
      alert(err.response?.data?.message || "Failed to add service. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '0 20px' }}>
        <div style={styles.card}>
          <h2 style={styles.title}>List a New Service</h2>
          <p style={styles.subtitle}>Enter the details to start receiving bookings</p>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <label style={styles.label}>Service Title</label>
            <input 
              type="text" placeholder="e.g. Premium Haircut & Styling" required 
              style={styles.input} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Category */}
              <div>
                <label style={styles.label}>Category</label>
                <select 
                  style={styles.input} value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Cleaning">Cleaning</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Haircut">Haircut</option>
                  <option value="Painting">Painting</option>
                </select>
              </div>
              
              {/* Price */}
              <div>
                <label style={styles.label}>Price ($)</label>
                <input 
                  type="number" placeholder="50" required 
                  style={styles.input} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>

            {/* Location */}
            <label style={styles.label}>Service Location</label>
            <input 
              type="text" placeholder="City, State" required 
              style={styles.input} 
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />

            {/* Image URL */}
            <label style={styles.label}>Image URL (Cloudinary or Web Link)</label>
            <input 
              type="text" placeholder="https://..." 
              style={styles.input} 
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />

            {/* Description */}
            <label style={styles.label}>Description</label>
            <textarea 
              placeholder="Describe your service in detail..." rows="4"
              style={{...styles.input, resize: 'none'}} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>

            {/* Submit & Cancel */}
            <button 
              type="submit" disabled={loading}
              style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
            >
              {loading ? "Launching..." : "Launch Service"}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/provider-dashboard')}
              style={styles.cancelBtn}
            >
              Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Styling Object
const styles = {
  card: { 
    backgroundColor: 'white', 
    padding: '40px', 
    borderRadius: '32px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' 
  },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  subtitle: { color: '#64748b', marginBottom: '32px' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' },
  input: { 
    width: '100%', 
    padding: '12px 16px', 
    borderRadius: '12px', 
    border: '1px solid #cbd5e1', 
    marginBottom: '20px', 
    fontSize: '1rem', 
    outline: 'none',
    boxSizing: 'border-box'
  },
  submitBtn: { 
    width: '100%', 
    padding: '14px', 
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
    border: 'none', 
    color: 'white', 
    borderRadius: '12px', 
    fontWeight: '700', 
    fontSize: '1rem', 
    cursor: 'pointer', 
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', 
    marginBottom: '12px' 
  },
  cancelBtn: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: 'transparent', 
    border: '1px solid #cbd5e1', 
    borderRadius: '12px', 
    color: '#64748b', 
    fontWeight: '600', 
    cursor: 'pointer' 
  }
};

export default AddService;