import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  console.log('Firebase Admin initialized');
}

const adminDb = admin.database();
const adminAuth = admin.auth();

export async function PATCH(request: Request) {
  try {
    // Extract userId from request body
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Update Realtime Database to set 'isBanned: false' for the user
    const userRef = adminDb.ref(`users/${userId}`);
    await userRef.update({ isBanned: false });

    // Enable the user in Firebase Authentication
    await adminAuth.updateUser(userId, { disabled: false });

    return NextResponse.json({ message: `User ${userId} has been unbanned successfully.` });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return NextResponse.json({ error: "Error unbanning user" }, { status: 500 });
  }
}
