import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

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

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 1. Disable the user in Firebase Authentication
    await adminAuth.updateUser(userId, { disabled: true });

    // 2. Delete user data from the Realtime Database
    const userRef = adminDb.ref(`users/${userId}`);
    await userRef.remove();

    // 3. Delete all comments where userId = commentFrom
    const commentsRef = adminDb.ref('comments');
    const snapshot = await commentsRef.orderByChild('commentFrom').equalTo(userId).once('value');

    const updates: { [key: string]: null } = {};
    snapshot.forEach((childSnapshot) => {
      updates[childSnapshot.key as string] = null;
    });

    if (Object.keys(updates).length > 0) {
      await commentsRef.update(updates);
    }

    return NextResponse.json({ message: `User ${userId} has been banned and their comments have been deleted.` });
  } catch (error) {
    console.error("Error banning user and deleting comments:", error);
    return NextResponse.json({ error: "Error banning user and deleting comments" }, { status: 500 });
  }
}
