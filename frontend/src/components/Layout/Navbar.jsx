import { useState, useEffect, useContext } from 'react';
import { Zap, Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Resize listener for Responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const styles = {
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#020617',
      padding: isMobile ? '12px 20px' : '16px 40px',
      borderBottom: '1px solid #1e293b',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    logoIcon: {
      backgroundColor: '#2563eb',
      padding: '6px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)',
    },
    logoText: {
      color: 'white',
      fontSize: isMobile ? '1.2rem' : '1.5rem',
      fontWeight: '800',
      letterSpacing: '-0.5px',
    },
    actionSection: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '15px' : '24px',
    },
    linkBtn: {
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      fontSize: '1rem',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: '500'
    },
    primaryBtn: {
      backgroundColor: '#6366f1',
      color: 'white',
      padding: isMobile ? '8px 16px' : '10px 24px',
      borderRadius: '9999px',
      border: 'none',
      fontWeight: '600',
      fontSize: isMobile ? '0.9rem' : '1rem',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
      textDecoration: 'none',
      display: 'inline-block'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white'
    }
  };

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/" style={styles.logoSection}>
        <div style={styles.logoIcon}>
          <Zap size={isMobile ? 20 : 24} color="white" fill="white" />
        </div>
        <span style={styles.logoText}>Clickit</span>
      </Link>

      {/* Navigation Links & User Actions */}
      <div style={styles.actionSection}>
        {!isMobile && (
          <>
            <Link to="/browse" style={styles.linkBtn}>Browse</Link>
            <Link to="/explore" style={styles.linkBtn}>Providers</Link>
          </>
        )}

        {user ? (
          /* LOGGED IN VIEW */
          <div style={styles.userSection}>
            {/* Dashboard Link based on role */}
            <Link 
              to={user.isProvider ? "/provider-dashboard" : "/dashboard"} 
              style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
            >
              <LayoutDashboard size={20} />
              {!isMobile && <span>Dashboard</span>}
            </Link>

            <Link to="/profile" style={{ color: 'white' }}>
              <User size={22} />
            </Link>

            <button 
              onClick={logout} 
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={22} />
            </button>
          </div>
        ) : (
          /* LOGGED OUT VIEW */
          <Link to="/login" style={styles.primaryBtn}>
            Sign In
          </Link>
        )}

        {isMobile && <Menu color="white" size={24} style={{ cursor: 'pointer' }} />}
      </div>
    </nav>
  );
};

export default Navbar;