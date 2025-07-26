// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "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",
  authDomain: "citypulse-57059.firebaseapp.com",
  projectId: "citypulse-57059",
  storageBucket: "citypulse-57059.appspot.com",
  messagingSenderId: "737708385584",
  appId: "1:737708385584:web:YOUR_APP_ID", // Optional if known
  measurementId: "G-MEASUREMENT_ID" // Optional
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);