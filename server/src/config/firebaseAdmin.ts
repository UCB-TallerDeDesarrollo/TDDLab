import admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

const projectId =
  process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "Missing FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID for Firebase Admin initialization."
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ projectId });
}

export default admin;
