import { initializeApp } from "firebase/app";
import {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID
} from '../config.ts';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
};

const firebase: any = initializeApp(firebaseConfig);

const isTestEnv = import.meta.env.MODE === 'cypress' || import.meta.env.MODE === 'test';

let auth: any = null;
if (VITE_FIREBASE_API_KEY) {
  try {
    auth = getAuth(firebase);
  } catch (error) {
    if (!isTestEnv) {
      throw error;
    }
    console.warn('Firebase Auth no inicializado en test:', error);
  }
} else if (isTestEnv) {
  console.warn('Firebase API key ausente en test, Auth se saltea');
}

export { firebase, auth };
