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

// Define the type for comments
interface Comment {
  comment: string;
  commentFrom: string;
  commentFromName: string;
  commentFromPhoto: string;
  commentTime: string;
}

export async function DELETE(request: Request) {
  try {
    // Extract the full comment object from the request body
    const { comment, commentFrom, commentTime } = await request.json();
    
    if (!comment || !commentFrom || !commentTime) {
      return NextResponse.json({ error: "Missing required comment data" }, { status: 400 });
    }

    // Query the database to find the comment by comment, commentFrom, and commentTime
    const commentsRef = adminDb.ref("comments");
    const snapshot = await commentsRef
      .orderByChild("commentTime")
      .equalTo(commentTime)
      .once("value");

    const commentsObj = snapshot.val();

    // Check if the comment exists
    if (!commentsObj) {
      return NextResponse.json({ error: "No comment found with the provided data" }, { status: 404 });
    }

    // Find the exact comment by matching additional fields
    let commentKeyToDelete: string | null = null;
    Object.entries(commentsObj).forEach(([key, value]) => {
      const commentData = value as Comment; // Type casting the comment data

      if (
        commentData.comment === comment &&
        commentData.commentFrom === commentFrom &&
        commentData.commentTime === commentTime
      ) {
        commentKeyToDelete = key;
      }
    });

    if (!commentKeyToDelete) {
      return NextResponse.json({ error: "No matching comment found" }, { status: 404 });
    }

    // Delete the comment
    await commentsRef.child(commentKeyToDelete).remove();

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Error deleting comment" }, { status: 500 });
  }
}
