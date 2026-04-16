import React, { useState, useRef, useEffect } from 'react';
import { BotMessageSquare, Send, X, Sparkles } from 'lucide-react';
import API from "../../api/axios";

const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your AI Business Assistant 🚀" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ Send Message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setLoading(true);

    // Add user msg
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    try {
      const res = await API.post('/ai/chat', { prompt: userText });

      setMessages(prev => [
        ...prev,
        { role: 'ai', text: res.data.reply }
      ]);

    } catch (err) {
      let errorMsg = "Server error 😅 try again";

      if (err.response?.status === 429) {
        errorMsg = "AI busy hai 😴 30 sec baad try kar";
      }

      setMessages(prev => [
        ...prev,
        { role: 'ai', text: errorMsg }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend(e);
    }
  };

  const styles = {
    button: {
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      padding: '16px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
      zIndex: 10000,
    },
    window: {
      position: 'fixed',
      bottom: '100px',
      left: '24px',
      width: '350px',
      height: '500px',
      background: '#0f172a',
      borderRadius: '20px',
      display: isOpen ? 'flex' : 'none',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 10000,
    },
    header: {
      padding: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      color: 'white'
    },
    body: {
      flex: 1,
      padding: '10px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    user: {
      alignSelf: 'flex-end',
      background: '#6366f1',
      padding: '8px 12px',
      borderRadius: '10px',
      color: 'white'
    },
    ai: {
      alignSelf: 'flex-start',
      background: '#1e293b',
      padding: '8px 12px',
      borderRadius: '10px',
      color: 'white'
    },
    inputRow: {
      display: 'flex',
      padding: '10px',
      gap: '5px'
    },
    input: {
      flex: 1,
      padding: '10px',
      borderRadius: '10px',
      border: 'none'
    },
    send: {
      padding: '10px',
      background: '#6366f1',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1
    }
  };

  return (
    <>
      {/* CHAT WINDOW */}
      <div style={styles.window}>
        <div style={styles.header}>
          <span><Sparkles size={16}/> AI Assistant</span>
          <X onClick={() => setIsOpen(false)} style={{cursor:'pointer'}}/>
        </div>

        <div style={styles.body}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === 'user' ? styles.user : styles.ai}>
              {m.text}
            </div>
          ))}

          {loading && (
            <div style={styles.ai}>
              Typing...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} style={styles.inputRow}>
          <input
            style={styles.input}
            value={input}
            placeholder="Ask AI..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button style={styles.send} disabled={loading}>
            <Send size={16}/>
          </button>
        </form>
      </div>

      {/* BUTTON */}
      <button
        style={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BotMessageSquare color="white"/>
      </button>
    </>
  );
};

export default AIChatButton;