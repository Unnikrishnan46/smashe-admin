import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import serviceAccount from "../../../firebase/smashe-2ba56-firebase-adminsdk-s6kad-89f3195df5.json";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: 'https://smashe-2ba56-default-rtdb.asia-southeast1.firebasedatabase.app',
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
