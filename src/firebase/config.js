import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1LpJHYQ1kU8IBfgrUmw4gnHAqryDtF8A",
  authDomain: "task-board-5930f.firebaseapp.com",
  projectId: "task-board-5930f",
  storageBucket: "task-board-5930f.firebasestorage.app",
  messagingSenderId: "725110766019",
  appId: "1:725110766019:web:3f4941983b721b1f13a576",
  measurementId: "G-WVPVDEZRX0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);