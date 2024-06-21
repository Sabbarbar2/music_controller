import React, { createContext, useContext, useState } from 'react';
import axios from "axios";

const QueueContext = createContext();


export const useQueue = () => {
  return useContext(QueueContext);
};


export const QueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);

  const fetchQueue = async () => {
    try {
      const response = await axios.get('/spotify/queue/');
      setQueue(response.data);
    } catch (error) {
      console.error('Error fetching queue', error);
    }
  };

  return (
    <QueueContext.Provider value={{ queue, setQueue, fetchQueue }}>
      {children}
    </QueueContext.Provider>
  );
};