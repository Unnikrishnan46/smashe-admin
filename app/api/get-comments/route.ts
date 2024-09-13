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

export async function POST(request: Request) {
  console.log("server function working");
  
  try {
    // Extract userId from the request body
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Query the Realtime Database to get comments where commentTo == userId
    const commentsRef = adminDb.ref("comments");
    const snapshot = await commentsRef.orderByChild("commentTo").equalTo(userId).once("value");

    const commentsObj = snapshot.val();

    // Check if there are comments
    if (!commentsObj) {
      return NextResponse.json({ message: "No comments found for this user." });
    }

    // Convert the object of comments to an array without the document IDs
    const commentsArray = Object.values(commentsObj);

    return NextResponse.json({ message: `Comments for user ${userId}`, comments: commentsArray });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Error fetching comments" }, { status: 500 });
  }
}
