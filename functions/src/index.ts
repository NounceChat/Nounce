import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// removes first two users from queue and creates a chat with them and returns chat id if there are less than two users in queue
export const queueChat = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    const queueRef = db.collection("queue");
    const queue = await queueRef.get();
    const timeNow = new Date()
    if (queue.size < 2) {
        // listen for a newly added chat document created after timeNow and return its id
        // return new Promise((resolve, reject) => {
        //     const unsubscribe = db.collection("chats").where('participants', 'array-contains', data.phoneNumber).onSnapshot((snapshot) => {
        //         snapshot.docChanges().forEach((change) => {
        //             if (change.type === "added" && new Date(change.doc.data().createdAt) > timeNow) {
        //                 unsubscribe();
        //                 resolve(change.doc.id);
        //             }
        //         });
        //     })
        // })
        return null;
    }
    const chatRef = db.collection("chats").doc();
    const first = queue.docs[0];
    const second = queue.docs[1];
    await chatRef.set({
        participants: [first.data().number, second.data().number],
        messages: [],
        createdAt: timeNow
    });
    await first.ref.delete();
    await second.ref.delete();
    return chatRef.id;
});