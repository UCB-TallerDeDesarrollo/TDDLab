import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "tddlab-hosting-firebase.firebaseapp.com",
  projectId: "tddlab-hosting-firebase",
  storageBucket: "tddlab-hosting-firebase.appspot.com",
  messagingSenderId: "333240761636",
  appId: "1:333240761636:web:0e6129804aa05b7e8907b1",
};

const firebase: any = initializeApp(firebaseConfig);

export default firebase;
