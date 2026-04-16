import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANEVPSke2bWdCGY-zbGne6mGUIpgZtWAA",
  authDomain: "scanos-76346.firebaseapp.com",
  databaseURL: "https://console.firebase.google.com/u/0/project/scanos-76346/firestore/databases/default/data",
  projectId: "scanos-76346",
  storageBucket: "scanos-76346.firebasestorage.app",
  messagingSenderId: "804722044562",
  appId: "1:804722044562:web:3aa37fe15f4f679f5ec04b",
  measurementId: "G-0L5FD0HPZS"
};

console.log(firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)

