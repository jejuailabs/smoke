import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const localEnv = resolve(root, ".env.local");
const values = { ...process.env };

if (existsSync(localEnv)) {
  for (const line of readFileSync(localEnv, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (match && values[match[1]] === undefined) {
      values[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
    }
  }
}

const fields = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
  measurementId: "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
};

const firebaseConfig = Object.fromEntries(
  Object.entries(fields).map(([field, name]) => [field, values[name] || ""]),
);
writeFileSync(
  resolve(root, "public", "experience", "js", "firebase-config.js"),
  `export const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};\n`,
);
console.log("Prepared experience Firebase web configuration.");
