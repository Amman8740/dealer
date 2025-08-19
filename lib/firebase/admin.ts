// lib/firebase/admin.ts
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

export const adminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })
    : getApps()[0];

export const db = getFirestore(adminApp);
