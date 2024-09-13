import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import serviceAccount from "../../../firebase/smashe-2ba56-firebase-adminsdk-s6kad-89f3195df5.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: 'https://smashe-2ba56-default-rtdb.asia-southeast1.firebasedatabase.app',
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
