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
