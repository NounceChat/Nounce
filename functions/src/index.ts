import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// removes first two users from queue and creates a chat with them and returns chat id if there are less than two users in queue, returns null
export const queueChat = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    const queueRef = db.collection("queue");
    const queue = await queueRef.get();
    if (queue.size < 2) {
        return null;
    }
    const first = queue.docs[0];
    const second = queue.docs[1];
    const chatRef = db.collection("chats").doc();
    await chatRef.set({
        participants: [first.data().number, second.data().number],
        messages: [],
        createdAt: new Date()
    });
    await first.ref.delete();
    await second.ref.delete();
    return chatRef.id;
});