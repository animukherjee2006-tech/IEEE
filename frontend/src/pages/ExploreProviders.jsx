import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../api/axios';

const ExploreProviders = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Cleaning', 'Plumbing', 'Electrician', 'Haircut', 'Painting', 'Technician'];

  // ================= FETCH SERVICES FROM BACKEND =================
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Backend controller query params use kar raha hai (category, search)
        const res = await API.get('/services', {
          params: {
            category: selectedCategory,
            search: searchQuery
          }
        });
        
        if (res.data.success) {
          setServices(res.data.services);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debouncing: 300ms wait karega type karne ke baad API call karne ke liye
    const timeoutId = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  // ================= STYLES =================
  const styles = {
    page: { backgroundColor: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' },
    container: { padding: '40px 60px' },
    hero: { textAlign: 'center', marginBottom: '50px' },
    searchBar: {
      width: '100%', maxWidth: '600px', padding: '16px 24px', borderRadius: '16px',
      border: '1px solid #1f2937', backgroundColor: '#0f172a', color: 'white',
      fontSize: '1rem', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      transition: '0.3s'
    },
    categoryContainer: { display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' },
    chip: (active) => ({
      padding: '10px 20px', borderRadius: '100px', border: '1px solid #1f2937',
      backgroundColor: active ? '#6366f1' : '#111827', color: active ? 'white' : '#94a3b8',
      cursor: 'pointer', fontWeight: '600', transition: '0.2s'
    }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
    card: { 
      backgroundColor: '#111827', borderRadius: '24px', border: '1px solid #1f2937', 
      overflow: 'hidden', transition: 'transform 0.3s', cursor: 'pointer'
    },
    imgBox: { height: '180px', background: 'linear-gradient(45deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' },
    content: { padding: '20px' },
    price: { color: '#22c55e', fontWeight: '800', fontSize: '1.2rem' },
    btn: { 
      width: '100%', padding: '12px', marginTop: '15px', borderRadius: '12px', border: 'none',
      backgroundColor: '#6366f1', color: 'white', fontWeight: '700', cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '10px', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Find the Best Experts
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Premium home services at the click of a button</p>
          
          <div style={{ marginTop: '30px' }}>
            <input 
              type="text" 
              placeholder="Search for 'Deep Cleaning' or 'Electrician'..." 
              style={styles.searchBar}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={styles.categoryContainer}>
          {categories.map(cat => (
            <button 
              key={cat} 
              style={styles.chip(selectedCategory === cat)}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#6366f1' }}>Loading Experts...</div>
        ) : (
          <div style={styles.grid}>
            {services.length > 0 ? (
              services.map((s) => (
                <div key={s._id} style={styles.card} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={styles.imgBox}>
                    {s.image ? <img src={s.image} alt={s.title} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : "🛠️"}
                  </div>
                  
                  <div style={styles.content}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold', textTransform: 'uppercase' }}>{s.category}</span>
                      <span style={styles.price}>₹{s.price}</span>
                    </div>
                    
                    <h3 style={{ margin: '10px 0 5px 0' }}>{s.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '15px' }}>{s.location || 'Kolkata, WB'}</p>
                    
                    <div style={{ borderTop: '1px solid #1f2937', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>By: {s.provider?.name || 'Expert'}</span>
                      <button 
                        style={styles.btn}
                        onClick={() => navigate(`/book/${s._id}`)} // Navigate to Checkout
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#475569', marginTop: '50px' }}>
                <h3>No experts found for this search.</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreProviders;