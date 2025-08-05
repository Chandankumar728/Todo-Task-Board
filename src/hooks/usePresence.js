import { useEffect, useState } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userId] = useState(() => Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const userRef = doc(db, 'presence', userId);
    
   
    const setOnline = () => {
      setDoc(userRef, {
        userId,
        lastSeen: new Date(),
        isOnline: true
      });
    };

    const setOffline = () => {
      deleteDoc(userRef);
    };

    setOnline();

    
    const unsubscribe = onSnapshot(collection(db, 'presence'), (snapshot) => {
      setOnlineUsers(snapshot.size);
    });

  
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', setOffline);

    return () => {
      setOffline();
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', setOffline);
    };
  }, [userId]);

  return { onlineUsers };
};