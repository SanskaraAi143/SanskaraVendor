import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCYtbCLPFMZb-9TgQLWQi5Y5FS2TP5ioQk",
  authDomain: "sanskaraai.firebaseapp.com",
  projectId: "sanskaraai",
  storageBucket: "sanskaraai.firebasestorage.app",
  messagingSenderId: "877807411346",
  appId: "1:877807411346:web:a3c9c5c9d060970120064b",
  measurementId: "G-8TWJEN42YF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "sanskaraai-vendors");
export const storage = getStorage(app);

export default app;
