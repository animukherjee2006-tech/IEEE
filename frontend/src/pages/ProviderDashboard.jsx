import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Layout/Navbar';
import { useSocket } from '../context/SocketContext';
import { 
  CheckCircle, X, MessageSquare, Clock, IndianRupee, 
  Star, Wrench, RefreshCw, Send, MessageCircle, 
  Users, Calendar, TrendingUp, Plus
} from 'lucide-react';
import AIChat from '../components/ui/AIChatButton';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const scrollRef = useRef();
  
  // Safety initialization to prevent "undefined" errors
  const [data, setData] = useState({
    stats: { totalEarnings: 0, totalBookings: 0, rating: 4.8, jobsThisMonth: 0 },
    bookings: [],
    performance: { responseRate: 98, completionRate: 95 }
  });
  const [loading, setLoading] = useState(true);
  
  // Chat States
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [providerMessage, setProviderMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // User Info from LocalStorage
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const providerId = user?.id || user?._id;

  const fetchDashboardData = useCallback(async () => {
    if (!providerId) { navigate('/login'); return; }
    try {
      const res = await API.get(`/bookings/requests`);
      // Mapping API data to state
      setData({
        stats: { 
            totalEarnings: res.data.totalEarnings || 0, 
            totalBookings: res.data.bookings?.length || 0,
            rating: 4.8,
            jobsThisMonth: res.data.bookings?.filter(b => b.status === 'accepted').length || 0
        },
        bookings: res.data.bookings || [],
        performance: { responseRate: 98, completionRate: 92 }
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally { setLoading(false); }
  }, [providerId, navigate]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // Socket.io for Real-time Chat
  useEffect(() => {
    if (!socket || !activeChatBooking) return;
    socket.emit('join_room', activeChatBooking._id);

    const handleMessage = (msg) => {
      if (msg.bookingId === activeChatBooking._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive_message', handleMessage);
    return () => socket.off('receive_message', handleMessage);
  }, [socket, activeChatBooking]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = async (booking) => {
    setActiveChatBooking(booking);
    try {
      const res = await API.get(`/messages/${booking._id}`);
      if (res.data.success) setMessages(res.data.messages);
    } catch (err) { console.error("Chat fetch error"); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatBooking) return;

    const msgData = {
      bookingId: activeChatBooking._id,
      text: newMessage,
      sender: providerId,
      receiver: activeChatBooking.consumer?._id
    };

    try {
      await API.post('/messages', msgData);
      socket.emit('send_message', msgData);
      setNewMessage('');
    } catch (err) { console.error("Send error"); }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await API.patch(`/bookings/update-status/${selectedBooking._id}`, { 
        status: selectedBooking.newStatus,
        message: providerMessage 
      });
      setShowModal(false);
      fetchDashboardData();
    } catch (err) { alert("Status update failed"); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div style={{background:'#020617', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'white'}}>
      Loading Provider Workspace...
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />
      
      <div style={styles.container}>
        {/* HEADER WITH PROVIDER NAME */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Welcome back, {user?.name || 'Partner'}</h1>
            <p style={styles.subtitle}>Track your performance and manage client requests</p>
          </div>
          <button style={styles.addServiceBtn} onClick={() => navigate('/add-service')}>
            <Plus size={18} /> Add New Service
          </button>
        </div>

        {/* 1. STATS SECTION (Fixing toLocaleString Error) */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statTop}><div style={{...styles.iconBox, background: 'rgba(99,102,241,0.1)'}}><IndianRupee size={18} color="#6366f1"/></div></div>
            <h2 style={styles.statValue}>₹{data.stats?.totalEarnings?.toLocaleString() || '0'}</h2>
            <p style={styles.statLabel}>Total Earnings</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statTop}><div style={{...styles.iconBox, background: 'rgba(34,197,94,0.1)'}}><Users size={18} color="#22c55e"/></div></div>
            <h2 style={styles.statValue}>{data.stats?.totalBookings || '0'}</h2>
            <p style={styles.statLabel}>Total Orders</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statTop}><div style={{...styles.iconBox, background: 'rgba(245,158,11,0.1)'}}><Star size={18} color="#f59e0b"/></div></div>
            <h2 style={styles.statValue}>{data.stats?.rating || '4.8'}</h2>
            <p style={styles.statLabel}>Avg Rating</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statTop}><div style={{...styles.iconBox, background: 'rgba(239,68,68,0.1)'}}><Clock size={18} color="#ef4444"/></div></div>
            <h2 style={styles.statValue}>{data.stats?.jobsThisMonth || '0'}</h2>
            <p style={styles.statLabel}>Active Jobs</p>
          </div>
        </div>

        <div style={styles.mainGrid}>
          {/* LEFT: UPCOMING & PERFORMANCE */}
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <h3 style={styles.cardHeader}><Calendar size={18} color="#6366f1"/> Upcoming Appointments</h3>
              <div style={styles.listArea}>
                {data.bookings.length > 0 ? data.bookings.map((apt) => (
                  <div key={apt._id} style={styles.aptItem}>
                    <div style={styles.aptInfo}>
                      <h4 style={styles.custName}>{apt.consumer?.name}</h4>
                      <p style={styles.servName}>{apt.serviceType}</p>
                      <small style={styles.timeTag}><Clock size={10}/> {apt.date} • {apt.time}</small>
                    </div>
                    <div style={styles.aptActions}>
                      <span style={{...styles.statusBadge, 
                        color: apt.status === 'pending' ? '#f59e0b' : '#22c55e',
                        background: apt.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)'
                      }}>{apt.status}</span>
                      <button style={styles.chatIcon} onClick={() => selectChat(apt)}><MessageSquare size={14}/></button>
                      {apt.status === 'pending' && (
                        <button style={styles.acceptBtn} onClick={() => { setSelectedBooking({...apt, newStatus: 'accepted'}); setShowModal(true); }}>Accept</button>
                      )}
                    </div>
                  </div>
                )) : <div style={styles.emptyText}>No appointments found</div>}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardHeader}><TrendingUp size={18} color="#6366f1"/> Performance Metrics</h3>
              <div style={styles.perfPadding}>
                <div style={styles.perfRow}>
                  <div style={styles.perfLabel}><span>Response Rate</span> <span>{data.performance.responseRate}%</span></div>
                  <div style={styles.barBG}><div style={{...styles.barFill, width: `${data.performance.responseRate}%`, background:'#22c55e'}}></div></div>
                </div>
                <div style={styles.perfRow}>
                  <div style={styles.perfLabel}><span>Completion Rate</span> <span>{data.performance.completionRate}%</span></div>
                  <div style={styles.barBG}><div style={{...styles.barFill, width: `${data.performance.completionRate}%`, background:'#6366f1'}}></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: REAL-TIME CHAT */}
          <div style={styles.chatCol}>
            <div style={styles.chatCard}>
              <div style={styles.chatHeader}>
                <MessageCircle size={18} color="#6366f1"/> 
                <span>{activeChatBooking ? `Chat: ${activeChatBooking.consumer?.name}` : "Client Messages"}</span>
              </div>
              <div style={styles.chatBody}>
                {activeChatBooking ? messages.map((m, i) => (
                  <div key={i} style={m.sender === providerId ? styles.msgRight : styles.msgLeft}>
                    <div style={m.sender === providerId ? styles.bubbleRight : styles.bubbleLeft}>{m.text}</div>
                  </div>
                )) : <div style={styles.chatHint}>Select a chat from appointments</div>}
                <div ref={scrollRef} />
              </div>
              {activeChatBooking && (
                <form onSubmit={sendMessage} style={styles.chatInputArea}>
                  <input style={styles.chatInput} placeholder="Message..." value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} />
                  <button type="submit" style={styles.chatSend}><Send size={16}/></button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{margin:0}}>Confirm Acceptance</h3>
            <p style={{fontSize:'12px', color:'#64748b', margin:'10px 0'}}>Send a note to your customer</p>
            <textarea style={styles.modalInput} value={providerMessage} onChange={(e)=>setProviderMessage(e.target.value)} placeholder="I will be there..." />
            <div style={styles.modalBtns}>
              <button style={styles.mCancel} onClick={()=>setShowModal(false)}>Cancel</button>
              <button style={styles.mConfirm} onClick={handleStatusUpdate}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <AIChat />
    </div>
  );
};

// FULL DARK THEME STYLES
const styles = {
  page: { background: '#020617', minHeight: '100vh', color: '#f8fafc', paddingBottom: '40px' },
  container: { maxWidth: '1300px', margin: '0 auto', padding: '0 20px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '100px', marginBottom: '30px' },
  title: { fontSize: '24px', fontWeight: '800', margin: 0 },
  subtitle: { color: '#64748b', margin: '5px 0 0', fontSize: '14px' },
  addServiceBtn: { background: '#6366f1', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '35px' },
  statCard: { background: '#0f172a', padding: '22px', borderRadius: '18px', border: '1px solid #1e293b' },
  statTop: { marginBottom: '12px' },
  iconBox: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px' },
  statLabel: { color: '#64748b', fontSize: '13px' },

  mainGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '25px' },
  card: { background: '#0f172a', borderRadius: '18px', border: '1px solid #1e293b', overflow: 'hidden' },
  cardHeader: { padding: '18px 22px', borderBottom: '1px solid #1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' },
  
  listArea: { padding: '10px' },
  aptItem: { display: 'flex', justifyContent: 'space-between', padding: '15px 12px', borderBottom: '1px solid #1e293b' },
  custName: { margin: 0, fontSize: '15px' },
  servName: { margin: '2px 0', fontSize: '13px', color: '#6366f1' },
  timeTag: { fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' },
  aptActions: { display: 'flex', alignItems: 'center', gap: '10px' },
  statusBadge: { fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase' },
  chatIcon: { border: '1px solid #334155', background: '#1e293b', padding: '6px', borderRadius: '8px', cursor: 'pointer' },
  acceptBtn: { background: '#22c55e', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },

  perfPadding: { padding: '20px' },
  perfRow: { marginBottom: '15px' },
  perfLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#94a3b8' },
  barBG: { height: '8px', background: '#1e293b', borderRadius: '10px' },
  barFill: { height: '100%', borderRadius: '10px' },

  chatCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '18px', height: '540px', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  msgRight: { alignSelf: 'flex-end' },
  msgLeft: { alignSelf: 'flex-start' },
  bubbleRight: { background: '#6366f1', padding: '8px 14px', borderRadius: '14px 14px 0 14px', fontSize: '14px' },
  bubbleLeft: { background: '#1e293b', padding: '8px 14px', borderRadius: '14px 14px 14px 0', fontSize: '14px', border: '1px solid #334155' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #1e293b', display: 'flex', gap: '10px' },
  chatInput: { flex: 1, background: '#1e293b', border: 'none', padding: '10px', borderRadius: '8px', color: 'white', outline: 'none' },
  chatSend: { background: '#6366f1', border: 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
  chatHint: { textAlign: 'center', color: '#475569', marginTop: '150px' },
  emptyText: { textAlign: 'center', color: '#475569', padding: '20px' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(3px)' },
  modal: { background: '#0f172a', padding: '25px', borderRadius: '20px', width: '360px', border: '1px solid #334155' },
  modalInput: { width: '100%', height: '80px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px', color: 'white', outline: 'none', marginBottom: '15px' },
  modalBtns: { display: 'flex', gap: '10px' },
  mConfirm: { flex: 1, background: '#6366f1', border: 'none', color: 'white', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  mCancel: { flex: 1, background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '12px', borderRadius: '10px' }
};

export default ProviderDashboard;