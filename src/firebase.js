import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPpcitzCGvdNX1K8xk0bbA2SGbRv2EwLk",
  authDomain: "scopo-fit.firebaseapp.com",
  projectId: "scopo-fit",
  storageBucket: "scopo-fit.firebasestorage.app",
  messagingSenderId: "676204659013",
  appId: "1:676204659013:web:0ecd618cd2ca967ada3e2c",
  measurementId: "G-EH4V1594BS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
