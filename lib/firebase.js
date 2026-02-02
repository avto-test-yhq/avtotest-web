// 1. Kerakli funksiyalarni chaqiramiz
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 2. Sozlamalarni .env fayldan o'qiymiz
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 3. Ilovani ishga tushirish (Singleton pattern)
// Next.js da qayta-qayta yuklanganda xatolik bermasligi uchun tekshiramiz
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 4. Auth va Providerni eksport qilamiz
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Tilni o'zbekchaga sozlash (SMS va Email xabarlari uchun)
auth.useDeviceLanguage(); 

export { auth, googleProvider };