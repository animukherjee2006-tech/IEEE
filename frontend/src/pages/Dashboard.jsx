import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import AIChatButton from '../components/ui/AIChatButton';
import API from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { 
  MessageCircle, Clock, CheckCircle, Star, Search, 
  Calendar, User as UserIcon, XCircle, CheckCheck 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [data, setData] = useState({ bookings: [], stats: {}, user: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await API.get('/bookings/my-bookings');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await API.patch(`/bookings/update-status/${bookingId}`, { 
        status: newStatus,
        message: newStatus === 'cancelled' ? "Cancelled by consumer" : "Service completed"
      });
      
      if (res.data.success) {
        setData(prev => ({
          ...prev,
          bookings: prev.bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b)
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  useEffect(() => {
    const userId = data.user?.id || data.user?._id;
    if (!socket || !userId) return;
    socket.emit('join_room', userId);

    socket.on('booking_status_updated', (payload) => {
      setData(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => 
          b._id === payload.bookingId ? { ...b, status: payload.status, providerNote: payload.providerNote } : b
        )
      }));
    });

    return () => socket.off('booking_status_updated');
  }, [socket, data.user]);

  const filteredBookings = data.bookings?.filter((booking) => {
    const status = booking.status?.toLowerCase();
    const isUpcoming = activeTab === 'Upcoming' && ['pending', 'accepted', 'confirmed'].includes(status);
    const isPast = activeTab === 'Past' && ['completed', 'cancelled'].includes(status);
    
    const matchesTab = isUpcoming || isPast;
    const matchesSearch = 
      booking.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      booking.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) return <div style={styles.loader}>Loading Clickit...</div>;

  return (
    <div style={styles.page}>
      <Navbar />
      
      <section style={styles.hero}>
        <div style={{ flex: 1 }}>
          <h1 style={styles.welcomeText}>Hello, {data.user?.name || 'Valued Client'}!</h1>
          <p style={styles.subtitle}>Track your requested services and provider updates in real-time.</p>
        </div>
        <div style={styles.searchBox}>
           <Search size={18} color="#64748b" />
           <input 
             type="text" 
             placeholder="Search bookings..." 
             style={styles.searchInput}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </section>

      <div style={styles.statsGrid}>
        <StatCard icon={<Clock />} title="Active Requests" value={data.stats?.upcoming || 0} color="#3b82f6" />
        <StatCard icon={<CheckCircle />} title="Completed" value={data.stats?.completed || 0} color="#22c55e" />
        <StatCard icon={<Star />} title="Experience" value={data.stats?.favorites || 0} color="#f59e0b" />
      </div>

      <div style={styles.tabWrapper}>
        {['Upcoming', 'Past'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={styles.tab(activeTab === tab)}>{tab}</button>
        ))}
      </div>

      <div style={styles.listContainer}>
        {filteredBookings?.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking._id} style={styles.bookingCard}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.serviceTitle}>{booking.serviceType}</h3>
                  <div style={styles.infoRow}>
                    <UserIcon size={14} color="#6366f1" />
                    <span style={styles.providerName}>Provider: {booking.provider?.name || 'Professional'}</span>
                  </div>
                </div>
                <div style={styles.badgeWrapper}>
                  <span style={styles.statusBadge(booking.status)}>{booking.status}</span>
                  <div style={styles.priceText}>₹{booking.price}</div>
                </div>
              </div>

              {booking.providerNote && (
                <div style={styles.messageBox}>
                  <MessageCircle size={18} style={styles.msgIcon} />
                  <div style={{ flex: 1 }}>
                    <small style={styles.msgLabel}>PROVIDER NOTE</small>
                    <p style={styles.msgText}>"{booking.providerNote}"</p>
                  </div>
                </div>
              )}

              <div style={styles.cardFooter}>
                <div style={styles.dateTime}>
                  <Calendar size={14} style={{marginRight: '5px'}} />
                  {new Date(booking.date).toLocaleDateString()} | 🕒 {booking.time}
                </div>
                
                <div style={styles.actionGroup}>
                  <button 
                    style={styles.chatBtn} 
                    onClick={() => navigate(`/chat/${booking._id}`, { 
                      state: { providerName: booking.provider?.name, providerId: booking.provider?._id } 
                    })}
                  >
                    <MessageCircle size={16} /> Chat
                  </button>

                  {activeTab === 'Upcoming' && (
                    <>
                      <button 
                        style={styles.cancelBtn} 
                        onClick={() => { if(window.confirm("Cancel?")) updateBookingStatus(booking._id, 'cancelled') }}
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                      <button 
                        style={styles.completeBtn} 
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                      >
                        <CheckCheck size={16} /> Mark Completed
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyState}>No {activeTab.toLowerCase()} bookings found.</p>
            <Link to="/explore" style={styles.exploreLink}>Explore services now</Link>
          </div>
        )}
      </div>
      <AIChatButton />
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.iconContainer, color, backgroundColor: `${color}15` }}>{icon}</div>
    <div>
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{value}</h2>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>{title}</p>
    </div>
  </div>
);

const styles = {
  page: { backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, sans-serif' },
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6366f1', backgroundColor: '#020617' },
  hero: { padding: '50px 40px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  welcomeText: { fontSize: '2.5rem', fontWeight: '900', margin: 0 },
  subtitle: { color: '#94a3b8', marginTop: '8px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '12px 20px', borderRadius: '14px', border: '1px solid #1e293b', width: '300px' },
  searchInput: { background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', padding: '0 40px', marginBottom: '40px' },
  statCard: { background: '#111827', padding: '24px', borderRadius: '24px', border: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '18px' },
  iconContainer: { padding: '12px', borderRadius: '15px' },
  tabWrapper: { display: 'flex', gap: '30px', padding: '0 40px', marginBottom: '25px', borderBottom: '1px solid #1f2937' },
  tab: (active) => ({ padding: '12px 10px', border: 'none', borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent', backgroundColor: 'transparent', color: active ? '#3b82f6' : '#64748b', fontWeight: '700', cursor: 'pointer' }),
  listContainer: { padding: '0 40px 60px' },
  bookingCard: { background: '#111827', padding: '28px', borderRadius: '28px', border: '1px solid #1f2937', marginBottom: '20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  serviceTitle: { margin: 0, fontSize: '1.4rem', fontWeight: '800' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
  providerName: { color: '#94a3b8' },
  badgeWrapper: { textAlign: 'right' },
  priceText: { fontSize: '1.4rem', fontWeight: '900', color: '#6366f1' },
  messageBox: { background: 'rgba(99, 102, 241, 0.05)', padding: '15px', borderRadius: '15px', borderLeft: '5px solid #6366f1', margin: '20px 0' },
  msgIcon: { color: '#6366f1' },
  msgLabel: { fontWeight: '800', color: '#6366f1', fontSize: '0.65rem' },
  msgText: { margin: '5px 0 0 0', fontStyle: 'italic', color: '#e2e8f0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2937', paddingTop: '20px' },
  dateTime: { color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center' },
  actionGroup: { display: 'flex', gap: '10px' },
  chatBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', color: '#6366f1', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  completeBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: '#22c55e', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  statusBadge: (status) => ({ 
    padding: '6px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', 
    background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' 
  }),
  emptyContainer: { textAlign: 'center', padding: '80px 20px', background: '#0f172a', borderRadius: '24px', border: '1px dashed #1e293b' },
  emptyState: { color: '#64748b', marginBottom: '10px' },
  exploreLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }
};

export default Dashboard;
