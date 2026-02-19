import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBjufHdS0tO8otkI8lsyh6k17mwpPYD-qo",
  authDomain: "daw-db.firebaseapp.com",
  projectId: "daw-db",
  storageBucket: "daw-db.firebasestorage.app",
  messagingSenderId: "228409507163",
  appId: "1:228409507163:web:e1b904f0ad2b386556ee7e",
  measurementId: "G-7XZHT3FK8C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
