import { initializeApp } from "firebase/app";
import {
  VITE_FIREBASE_API_KEY, 
  VITE_FIREBASE_AUTH_DOMAIN, 
  VITE_FIREBASE_PROJECT_ID, 
  VITE_FIREBASE_STORAGE_BUCKET, 
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID } from '../config.ts'
  
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
};

const firebase: any = initializeApp(firebaseConfig);

export default firebase;
