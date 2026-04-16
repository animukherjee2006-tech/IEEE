import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import CategoryCard from '../components/ui/CategoryCard';
import AIChatButton from '../components/ui/AIChatButton';
import { Search, UserPlus, Sparkles } from 'lucide-react';
import API from '../api/axios';

const LandingPage = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [categories, setCategories] = useState([
    { title: "Cleaning", count: 1, type: "cleaning" },
    { title: "Plumbing", count: 1, type: "plumbing" },
    { title: "Electrical", count: 0, type: "electrical" },
    { title: "Painting", count: 0, type: "painting" },
    { title: "Salon", count: 0, type: "salon" },
    { title: "Carpentry", count: 0, type: "carpentry" },
    { title: "Appliance", count: 0, type: "appliance" },
    { title: "Pest Control", count: 0, type: "pest" },
  ]);

  // Backend se real-time counts fetch karne ke liye
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const res = await API.get('/services/category-stats'); 
        if (res.data.success) {
          // Agar backend ready hai toh counts update ho jayenge
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.log("Backend not connected yet, showing default counts.");
      }
    };
    fetchCategoryStats();

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#020617',
      fontFamily: 'sans-serif',
    },
    hero: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: isMobile ? '60px 20px' : '100px 20px',
    },
    badge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#1e293b',
      color: '#cbd5e1',
      padding: '6px 16px',
      borderRadius: '9999px',
      marginBottom: '32px',
      fontSize: '0.875rem',
      border: '1px solid #334155',
    },
    heading: {
      fontSize: isMobile ? '2.5rem' : '4rem',
      fontWeight: '800',
      color: 'white',
      marginBottom: '24px',
      lineHeight: 1.1,
      maxWidth: '900px',
    },
    subheading: {
      fontSize: isMobile ? '1.1rem' : '1.25rem',
      color: '#94a3b8',
      maxWidth: '700px',
      marginBottom: '48px',
      lineHeight: 1.6,
    },
    btnGroup: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '20px',
      width: isMobile ? '100%' : 'auto',
    },
    primaryBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      backgroundColor: '#6366f1',
      color: 'white',
      padding: '16px 40px',
      borderRadius: '9999px',
      fontSize: '1.125rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: '0.3s',
    },
    secondaryBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      backgroundColor: 'transparent',
      color: 'white',
      padding: '16px 40px',
      borderRadius: '9999px',
      fontSize: '1.125rem',
      fontWeight: '600',
      border: '1px solid #334155',
      cursor: 'pointer',
      transition: '0.3s',
    },
    section: {
      padding: isMobile ? '40px 20px' : '60px 80px',
    },
    sectionTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: 'white',
      marginBottom: '40px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: isMobile ? '16px' : '24px',
    },
    // Card interaction wrapper
    cardWrapper: {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.badge}>
          <Sparkles size={16} color="#3b82f6" />
          Trusted by 10,000+ customers
        </div>
        <h1 style={styles.heading}>Find & Book Local Services</h1>
        <p style={styles.subheading}>
          Connect with trusted professionals in your area. From home cleaning to electrical repairs — get it done today.
        </p>

        <div style={styles.btnGroup}>
          {/* Click handle: Redirect to register */}
          <button 
            style={styles.primaryBtn}
            onClick={() => navigate('/register')}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            <Search size={20} /> Explore Services
          </button>
          <button 
            style={styles.secondaryBtn}
            onClick={() => navigate('/register')}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e293b'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <UserPlus size={20} /> Become a Provider
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Popular Categories</h2>
        <div style={styles.grid}>
          {categories.map((cat, index) => (
            <div 
              key={index} 
              style={styles.cardWrapper}
              onClick={() => navigate(`/browse?category=${cat.type}`)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <CategoryCard {...cat} />
            </div>
          ))}
        </div>
      </section>

      <AIChatButton />
    </div>
  );
};

export default LandingPage;