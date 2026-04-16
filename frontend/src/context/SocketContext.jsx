import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // create socket only once
    if (!socketRef.current) {
      socketRef.current = io('https://backend-ieeee.onrender.com', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected:', socketRef.current.id);
      });
    }

    // join room when userId changes
    if (userId && socketRef.current) {
      socketRef.current.emit('join_room', userId);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
