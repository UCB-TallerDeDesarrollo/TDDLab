import admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

const isTestEnvironment =
  process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);

const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.VITE_FIREBASE_PROJECT_ID ??
  (isTestEnvironment ? "test-project-id" : undefined);

const adminApps = Array.isArray((admin as typeof admin & { apps?: unknown[] }).apps)
  ? (admin as typeof admin & { apps: unknown[] }).apps
  : [];

if (!projectId) {
  throw new Error(
    "Missing FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID for Firebase Admin initialization."
  );
}

if (!adminApps.length) {
  admin.initializeApp({ projectId });
}

export default admin;
