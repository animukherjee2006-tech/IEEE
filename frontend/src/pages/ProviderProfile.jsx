import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'; // 1. Socket Client Import karo
import API from '../api/axios';
import Navbar from '../components/Layout/Navbar';

// Socket connection initialization (Server URL ke saath)
const socket = io('http://localhost:5000', { withCredentials: true });

const ProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Rating States
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/services/provider-profile/${providerId}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // 2. Room Join Logic: Provider ko uske personal room mein join karwao
    socket.emit('join_room', providerId);

    // 3. Socket Listener: Real-time update receive karne ke liye
    socket.on('receive_notification', (notification) => {
      console.log("Real-time Notification:", notification);
      
      // Data refresh karo taaki stars/stats update ho jayein
      fetchProfile(); 
      
      // Optional: Aap yahan ek toast notification dikha sakte hain
      // alert(`${notification.title}: ${notification.message}`);
    });

    // Cleanup logic
    return () => {
      socket.off('receive_notification');
    };
  }, [providerId]);

  // Backend Integration for Rating
  const handleRatingSubmit = async (selectedRating) => {
    setSubmitting(true);
    try {
      // Backend ko request bhejte waqt providerId pass ho rahi hai
      await API.post('/services/rate', { providerId, rating: selectedRating });
      
      // Local UI refresh
      await fetchProfile(); 
      alert("Rating submitted! Thanks for your feedback.");
    } catch (err) {
      console.error(err);
      alert("Error submitting rating. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, isInteractive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          onClick={() => isInteractive && !submitting && handleRatingSubmit(i)}
          onMouseEnter={() => isInteractive && setHover(i)}
          onMouseLeave={() => isInteractive && setHover(0)}
          style={{ 
            color: i <= (isInteractive ? (hover || 0) : Math.floor(rating)) ? '#fbbf24' : '#334155', 
            fontSize: isInteractive ? '2.5rem' : '1.2rem',
            cursor: isInteractive ? 'pointer' : 'default',
            transition: '0.2s',
            marginRight: '5px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const styles = {
    page: { backgroundColor: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px' },
    headerCard: { 
      backgroundColor: '#0f172a', padding: '40px', borderRadius: '24px', 
      border: '1px solid #1f2937', textAlign: 'center', marginBottom: '25px' 
    },
    avatar: { 
      width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#6366f1', 
      margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: '2rem', fontWeight: 'bold', boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' 
    },
    ratingInputSection: {
      backgroundColor: '#1e1b4b', padding: '30px', borderRadius: '20px', 
      border: '1px solid #4338ca', marginBottom: '30px', textAlign: 'center'
    },
    statsBox: {
      display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '20px',
      borderTop: '1px solid #1f2937', paddingTop: '20px'
    },
    serviceCard: { 
      backgroundColor: '#111827', padding: '20px', borderRadius: '16px', 
      border: '1px solid #1f2937', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }
  };

  if (loading) return <div style={{textAlign: 'center', color: '#6366f1', padding: '100px'}}>Loading Profile...</div>;
  if (!data) return <div style={{textAlign: 'center', padding: '100px'}}>Expert not found.</div>;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        
        {/* Profile Info */}
        <div style={styles.headerCard}>
          <div style={styles.avatar}>{data.provider.name.charAt(0)}</div>
          <h1 style={{fontSize: '2rem', marginBottom: '5px'}}>{data.provider.name}</h1>
          <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Verified Service Provider</p>
          
          <div style={styles.statsBox}>
            <div>
              <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{Number(data.stats.rating).toFixed(1)} ⭐</span><br/>
              <small style={{color: '#94a3b8'}}>Average Rating</small>
            </div>
            <div>
              <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{data.stats.completedJobs}+</span><br/>
              <small style={{color: '#94a3b8'}}>Jobs Done</small>
            </div>
          </div>
        </div>

        {/* INTERACTIVE RATING INPUT */}
        <div style={styles.ratingInputSection}>
          <h3 style={{marginBottom: '10px'}}>How was your experience?</h3>
          <p style={{color: '#a5b4fc', fontSize: '0.85rem', marginBottom: '15px'}}>
            {submitting ? "Submitting your feedback..." : "Click a star to rate this provider"}
          </p>
          <div style={{opacity: submitting ? 0.5 : 1}}>
            {renderStars(0, true)}
          </div>
        </div>

        {/* Services List */}
        <h2 style={{fontSize: '1.3rem', marginBottom: '20px', paddingLeft: '10px', borderLeft: '4px solid #6366f1'}}>
          Services by this Provider
        </h2>
        
        {data.services.map(service => (
          <div key={service._id} style={styles.serviceCard}>
            <div>
              <span style={{color: '#6366f1', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'}}>{service.category}</span>
              <h4 style={{margin: '5px 0'}}>{service.title}</h4>
              <p style={{color: '#64748b', fontSize: '0.85rem'}}>{service.location}</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '10px'}}>₹{service.price}</div>
              <button 
                onClick={() => navigate(`/book/${service._id}`)}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none', 
                  backgroundColor: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Book
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default ProviderProfile;