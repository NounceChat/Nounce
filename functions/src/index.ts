import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

export const queueChat = functions.https
    .onCall((data, context) => {
        const queueRef = admin.firestore().collection("queue");
        let queue:any;
        queueRef.get().then((snapshot) => { 
            queue = snapshot.docs.map((doc) => doc.data());
        });

        if (queue.length >= 2) {
            const chatRef = admin.firestore().collection("chats");
            const chat = {
                createdAt: new Date(),
                messages: [],
                participants: [queue[0].number, queue[1].number],
            };
            queueRef.doc(queue[0].id).delete();
            queueRef.doc(queue[1].id).delete();
            chatRef.add(chat)
                .then((docRef) => {
                    return docRef.id;
                })
        }
        return null;
    }
);