import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  projectId: process.env.TDDLOGS_FIREBASE_PROJECT_ID,
  clientEmail: process.env.TDDLOGS_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.TDDLOGS_FIREBASE_PRIVATE_KEY ? process.env.TDDLOGS_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

const appName = 'branchesDB';
let app: admin.app.App;

try {
  const existingApp = admin.apps.find(a => a?.name === appName);
  if (existingApp) {
    app = existingApp;
    console.log(`Firebase Admin app '${appName}' already initialized.`);
  } else {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    }, appName);
    console.log(`Firebase Admin app '${appName}' initialized successfully with project ID:`, serviceAccount.projectId);
  }
} catch (error) {
  console.error(`Firebase Admin app '${appName}' initialization error:`, error);
  // Re-throw the error to prevent the application from starting with an invalid DB connection
  throw error;
}

export const db = app.firestore();