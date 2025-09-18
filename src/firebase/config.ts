import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDj1LRQ-3PmQyVozNmOy59JIXYl4VXCuXc",
  authDomain: "moroccancourtking.firebaseapp.com",
  databaseURL: "https://moroccancourtking-default-rtdb.firebaseio.com",
  projectId: "moroccancourtking",
  storageBucket: "moroccancourtking.firebasestorage.app",
  messagingSenderId: "304470554646",
  appId: "1:304470554646:web:3ad4a079466422fb14dd37",
  measurementId: "G-L83L5PTE0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
