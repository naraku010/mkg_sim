
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyD2NznJb9le7rj_nQ8mirVWcDm72XZzuTI",
  authDomain: "mkgsim-a9783.firebaseapp.com",
  projectId: "mkgsim-a9783",
  storageBucket: "mkgsim-a9783.appspot.com",
  messagingSenderId: "244347350484",
  appId: "1:244347350484:web:b8a67dc382d410479efa41",
  measurementId: "G-B0M8XN3L3R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);