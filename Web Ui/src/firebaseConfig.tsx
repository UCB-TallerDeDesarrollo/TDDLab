import { initializeApp } from "firebase/app";
import {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
} from "../config.ts";

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
};

const requiredFirebaseFields = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

const hasValidFirebaseWebConfig = () => {
  const hasMissingField = requiredFirebaseFields.some(
    (field) => !firebaseConfig[field]
  );

  const hasInvalidApiKey =
    typeof firebaseConfig.apiKey === "string" &&
    !firebaseConfig.apiKey.startsWith("AIza");

  return !hasMissingField && !hasInvalidApiKey;
};

if (!hasValidFirebaseWebConfig()) {
  throw new Error(
    "Configuración de Firebase web inválida. Revisa VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID y VITE_FIREBASE_APP_ID en el archivo .env del frontend."
  );
}

const firebase: any = initializeApp(firebaseConfig);

export default firebase;
