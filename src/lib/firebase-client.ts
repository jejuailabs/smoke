"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import webConfig from "../../firebase-web-config.json";

type FirebaseClient = { auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> };
let cachedClient: FirebaseClient | undefined;

const matchingEnvironment = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === webConfig.projectId;
const config = {
  apiKey: matchingEnvironment && process.env.NEXT_PUBLIC_FIREBASE_API_KEY || webConfig.apiKey,
  authDomain: matchingEnvironment && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || webConfig.authDomain,
  projectId: webConfig.projectId,
  appId: matchingEnvironment && process.env.NEXT_PUBLIC_FIREBASE_APP_ID || webConfig.appId,
  storageBucket: matchingEnvironment && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || webConfig.storageBucket,
  messagingSenderId: matchingEnvironment && process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || webConfig.messagingSenderId,
  measurementId: matchingEnvironment && process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || webConfig.measurementId,
};

export function getFirebaseClient() {
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) return null;
  if (cachedClient) return cachedClient;
  const app = getApps().length ? getApp() : initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    measurementId: config.measurementId,
  });
  cachedClient = { auth: getAuth(app), db: getFirestore(app) };
  return cachedClient;
}
