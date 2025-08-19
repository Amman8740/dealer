// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpn_clktLX5skSGLhJLoXJKnWVj-tvPGY",
  authDomain: "dealer-715ef.firebaseapp.com",
  projectId: "dealer-715ef",
  storageBucket: "dealer-715ef.firebasestorage.app",
  messagingSenderId: "560194222894",
  appId: "1:560194222894:web:e6490cee493e49005258bf",
  measurementId: "G-M84JSFT51C"
};
export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
export const db = getFirestore(app);