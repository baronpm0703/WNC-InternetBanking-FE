// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
const VITE_FB_API_KEY = import.meta.env.VITE_FB_API_KEY
const VITE_FB_AUTH_DOMAIN = import.meta.env.VITE_FB_AUTH_DOMAIN
// const VITE_FB_DATABASE_URL = import.meta.env.VITE_FB_DATABASE_URL
const VITE_FB_PROJECT_ID = import.meta.env.VITE_FB_PROJECT_ID
const VITE_FB_STORAGE_BUCKET = import.meta.env.VITE_FB_STORAGE_BUCKET
const VITE_FB_MESSAGING_SENDER_ID = import.meta.env.VITE_FB_MESSAGING_SENDER_ID
const VITE_FB_APP_ID = import.meta.env.VITE_FB_APP_ID
// const VITE_FB_MEASUREMENT_ID = import.meta.env.VITE_FB_MEASUREMENT_ID

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: VITE_FB_API_KEY,
  authDomain: VITE_FB_AUTH_DOMAIN,
  projectId: VITE_FB_PROJECT_ID,
  storageBucket: VITE_FB_STORAGE_BUCKET,
  messagingSenderId: VITE_FB_MESSAGING_SENDER_ID,
  appId: VITE_FB_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export default app;
