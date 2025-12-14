import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully with project ID:", serviceAccount.projectId);
  } else {
    console.log("Firebase Admin already initialized.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
  // Re-throw the error to prevent the application from starting with an invalid DB connection
  throw error;
}

export const db = admin.firestore();
