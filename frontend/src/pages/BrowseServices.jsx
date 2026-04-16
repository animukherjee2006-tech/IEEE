import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { Search, X, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext'; // Context import kiya

const BrowseServices = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // User login hai ya nahi check karne ke liye
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const categories = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Salon', 'Carpentry', 'Appliance Repair', 'Pest Control'];

  const allServices = [
    { id: 1, name: 'Plumber', desc: 'Expert plumbing services for home.', price: '₹200', category: 'Plumbing', location: 'Kolkata' },
    { id: 2, name: 'House Cleaning', desc: 'Full home deep cleaning.', price: '₹500', category: 'Cleaning', location: 'Kolkata' },
    { id: 3, name: 'Electrician', desc: 'Wiring and appliance repair.', price: '₹300', category: 'Electrical', location: 'Kolkata' },
  ];

  // Logic: Agar user login nahi hai toh popup dikhao, warna action perform karo
  const handleProtectedAction = (e) => {
    if (!user) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const filteredServices = allServices.filter(service => {
    const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const styles = {
    page: { backgroundColor: '#020617', minHeight: '100vh', color: 'white', paddingBottom: '50px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    searchBox: { display: 'flex', gap: '15px', marginBottom: '30px' },
    inputWrapper: { flex: 1, position: 'relative' },
    input: { width: '100%', padding: '14px 14px 14px 45px', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', color: 'white', outline: 'none' },
    categoryScroll: { display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '40px', paddingBottom: '10px' },
    catBtn: (isActive) => ({
      padding: '8px 20px', backgroundColor: isActive ? '#312e81' : '#111827', border: `1px solid ${isActive ? '#6366f1' : '#1f2937'}`,
      borderRadius: '9999px', color: isActive ? 'white' : '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap'
    }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
    card: { backgroundColor: '#111827', borderRadius: '20px', overflow: 'hidden', border: '1px solid #1f2937', cursor: 'pointer', transition: '0.3s' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1f2937', maxWidth: '400px', textAlign: 'center', position: 'relative' },
    loginBtn: { backgroundColor: '#6366f1', color: 'white', padding: '12px 30px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '20px', width: '100%' }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Modal Popup */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <X style={{ position: 'absolute', right: '20px', top: '20px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowModal(false)} />
            <div style={{ backgroundColor: '#1e293b', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
              <Lock color="#6366f1" size={30} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Login Required</h2>
            <p style={{ color: '#94a3b8' }}>Please sign in to explore and book services in detail.</p>
            <button style={styles.loginBtn} onClick={() => navigate('/login')}>Login Now</button>
            <p style={{ marginTop: '15px', color: '#64748b', fontSize: '0.9rem' }}>
              New user? <span style={{ color: '#6366f1', cursor: 'pointer' }} onClick={() => navigate('/register')}>Register</span>
            </p>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Browse Services</h1>

        <div style={styles.searchBox}>
          <div style={styles.inputWrapper}>
            <Search style={{ position: 'absolute', left: '15px', top: '15px', color: '#64748b' }} size={20} />
            <input 
              style={styles.input} 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.categoryScroll}>
          {categories.map(cat => (
            <button 
              key={cat} 
              style={styles.catBtn(activeCategory === cat)}
              onClick={() => {
                if(!user && cat !== 'All') { setShowModal(true); } 
                else { setActiveCategory(cat); }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={styles.grid}>
          {filteredServices.map(service => (
            <div 
              key={service.id} 
              style={styles.card} 
              onClick={handleProtectedAction} // Har card pe click check
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#1f2937'}
            >
              <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ opacity: 0.3, fontSize: '50px' }}>🛠️</div>
              </div>
              <div style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#1f2937', padding: '4px 12px', borderRadius: '9999px', color: '#94a3b8' }}>
                  {service.category} • {service.location}
                </span>
                <h3 style={{ margin: '15px 0 5px 0', fontSize: '1.4rem' }}>{service.name}</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>{service.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6366f1' }}>{service.price}</span>
                  <button style={{ backgroundColor: '#1e293b', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseServices;