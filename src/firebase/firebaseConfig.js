// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC3x-ogq03kH0lwLPh4jfXF2Dd9DSJ8baU",
  authDomain: "chat-app-4fde9.firebaseapp.com",
  projectId: "chat-app-4fde9",
  storageBucket: "chat-app-4fde9.firebasestorage.app",
  messagingSenderId: "260822110450",
  appId: "1:260822110450:web:32b3f80010559263cf806b",
  measurementId: "G-1Q4NTFCW7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

const analytics = getAnalytics(app);

export default app;