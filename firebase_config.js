import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyANEVPSke2bWdCGY-zbGne6mGUIpgZtWAA",
  authDomain: "scanos-76346.firebaseapp.com",
  projectId: "scanos-76346",
  storageBucket: "scanos-76346.firebasestorage.app",
  messagingSenderId: "804722044562",
  appId: "1:804722044562:web:3aa37fe15f4f679f5ec04b",
  measurementId: "G-0L5FD0HPZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

