// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);