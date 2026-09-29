"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

type FirebaseClient = { auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> };
let cachedClient: FirebaseClient | undefined;

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseClient() {
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) return null;
  if (cachedClient) return cachedClient;
  const app = getApps().length ? getApp() : initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
  });
  cachedClient = { auth: getAuth(app), db: getFirestore(app) };
  return cachedClient;
}
