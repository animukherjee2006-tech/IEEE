import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';
import Navbar from '../components/Layout/Navbar';
import { Send, User as UserIcon } from 'lucide-react';

const ChatPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const { providerName, providerId } = location.state || {}; 
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  // Local user info for sender comparison
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const userId = user?.id || user?._id;

  // 1. Load Old Messages (URL Fixed to /messages)
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await API.get(`/messages/${bookingId}`); // Correct Path
        if (res.data.success) setMessages(res.data.messages);
      } catch (err) {
        console.error("Chat fetch error:", err);
      }
    };
    fetchChat();
  }, [bookingId]);

  // 2. Socket: Join Room & Listen
  useEffect(() => {
    if (!socket || !bookingId) return;

    // Room join karna MUST hai
    socket.emit('join_room', bookingId);

    const handleMessage = (data) => {
      if (data.bookingId === bookingId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on('receive_message', handleMessage);
    return () => socket.off('receive_message', handleMessage);
  }, [socket, bookingId]);

  // 3. Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const messageData = {
      bookingId,
      text: newMessage,
      sender: userId, // Pass actual ID
      receiver: providerId, 
    };

    try {
      // API call to save in DB
      const res = await API.post('/messages', messageData);
      
      if (res.data.success) {
        // Real-time emit
        socket.emit('send_message', messageData);
        setNewMessage('');
        // NOTE: Optimistic UI handleMessage se khud update ho jayega agar socket sahi set hai
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.chatHeader}>
        <div style={styles.avatar}>{providerName?.charAt(0)}</div>
        <h3>{providerName || 'Service Provider'}</h3>
      </div>

      <div style={styles.messageList}>
        {messages.map((msg, index) => (
          // Compare with actual userId
          <div key={index} style={msg.sender === userId || msg.sender === 'me' ? styles.myMsgRow : styles.otherMsgRow}>
            <div style={msg.sender === userId || msg.sender === 'me' ? styles.myMsg : styles.otherMsg}>
              {msg.text}
              <small style={styles.time}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
              </small>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form style={styles.inputArea} onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Type your message..." 
          style={styles.input} 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" style={styles.sendBtn} disabled={!newMessage.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', color: 'white' },
  chatHeader: { padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '15px', marginTop: '64px', background: '#0f172a' },
  avatar: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  messageList: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  myMsgRow: { display: 'flex', justifyContent: 'flex-end' },
  otherMsgRow: { display: 'flex', justifyContent: 'flex-start' },
  myMsg: { backgroundColor: '#6366f1', padding: '12px 16px', borderRadius: '20px 20px 4px 20px', maxWidth: '75%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  otherMsg: { backgroundColor: '#1e293b', padding: '12px 16px', borderRadius: '20px 20px 20px 4px', maxWidth: '75%', border: '1px solid #334155' },
  time: { display: 'block', fontSize: '0.6rem', marginTop: '5px', opacity: 0.6, textAlign: 'right' },
  inputArea: { padding: '20px', display: 'flex', gap: '12px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' },
  input: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px 18px', color: 'white', outline: 'none' },
  sendBtn: { backgroundColor: '#6366f1', border: 'none', borderRadius: '12px', color: 'white', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default ChatPage;