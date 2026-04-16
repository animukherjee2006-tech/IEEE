import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Backend URL (apna port check kar lena)
    const newSocket = io('https://ieee-backend-fp0e.onrender.com', {
      withCredentials: true
    });

    setSocket(newSocket);

    // Jab user login ho, use uske room mein join karwao
    if (userId) {
      newSocket.emit('join_room', userId);
    }

    return () => newSocket.close();
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
