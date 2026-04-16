import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Connection initialize karo with proper transports
    const newSocket = io('https://backend-ieeee.onrender.com', {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Fallback options
      reconnectionAttempts: 5,
    });

    // 2. Sirf tab emit karo jab connection confirm ho jaye
    newSocket.on('connect', () => {
      console.log('Connected to socket:', newSocket.id);
      if (userId) {
        newSocket.emit('join_room', userId);
      }
    });

    setSocket(newSocket);

    // 3. Cleanup function
    return () => {
      newSocket.off('connect');
      newSocket.disconnect();
    };
  }, [userId]); // Jab userId change hoga, naya room join hoga

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
