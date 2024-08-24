import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as path from 'path';
import * as admin from 'firebase-admin';
import WebSocket from 'ws';
const serviceAccountPath = path.resolve(
  __dirname,
  '../../serviceAccountKey.json'
);

if (!admin.apps.length) {
  initializeApp({
    credential: cert(require(serviceAccountPath)),
    storageBucket: 'gs://paperless-parking-27455.appspot.com',
  });
}

const db = getFirestore();
const storage = getStorage();
const storageBucket = storage.bucket();
const getUrl = async (filePath: string) => {
  const file = storageBucket.file(filePath);
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });
  return url;
};


export { db, storage, storageBucket, getUrl };
