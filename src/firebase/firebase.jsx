import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// ✅ Firebase configuration (ensure your API key is restricted in Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBc6laFdGZwiqM3UPERLDhJJ9kZ5-Oup1Y",
  authDomain: "clock-in-app-bb5ad.firebaseapp.com",
  projectId: "clock-in-app-bb5ad",
  storageBucket: "clock-in-app-bb5ad.appspot.com",
  messagingSenderId: "516008787213",
  appId: "1:516008787213:web:5882c1a74ea2399bb04444",
  measurementId: "G-JZ8NPGQBP9",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Export Firebase Services
export { auth, googleProvider, storage, db };
