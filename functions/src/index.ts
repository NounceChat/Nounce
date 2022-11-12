import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const Filter = require('bad-words');

// removes first two users from queue and creates a chat with them and returns chat id if there are less than two users in queue
export const queueChat = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    const queueRef = db.collection("queue");
    const queue = await queueRef.get();
    const timeNow = new Date()
    if (queue.size < 2) {
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

// listen for new chats and filter bad words 
export const filterBadWordsChats = functions.firestore.document("chats/{chatId}").onWrite(async (change, context) => {
    let hasProfanity = false
    let profaneSenders:string[] = [];
    const chat = change.after.data();
    const filter = new Filter();
    const messages = chat?.messages;

    const filteredMessages = messages.map((message:any) => {
        if (message.body==null || message.body=="") return {...message, body: ""}; 
        if (filter.isProfane(message.body))
        {
            hasProfanity = true;
            const filteredMessage = filter.clean(message.body)
            profaneSenders.push(message.number);
            return {...message, body: filteredMessage};
        }
        return message; 
    });
    
    await change.after.ref.update({messages: filteredMessages});

    if (hasProfanity) {
        admin.firestore().collection("phones").where("number", "in", profaneSenders).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if(doc.data().profanityStrike<=0) {
                    doc.ref.update({isBanned: true})
                }
                else {
                    doc.ref.update({profanityStrike: doc.data().profanityStrike-1})
                }
            })
        })  
    }
    return null;
}); 


// listen for new announcements and filter bad words
export const filterBadWordsAnnouncements = functions.firestore.document("announcements/{announcementId}").onCreate(async (snap, context) => {
    const announcement = snap.data();
    const filter = new Filter();
    const announcementText = announcement?.body
    if (filter.isProfane(announcementText)) {
        const filteredBody = filter.clean(announcementText);
        await snap.ref.update({body: filteredBody});
        //get phone with number of announcement.sender and update phone isBanned to true
        admin.firestore().collection("phones").where("number", "==", announcement?.sender).get()
        .then((querySnapshot) => {
            const docRef = querySnapshot.docs[0];
            if(docRef.data().profanityStrike<=0) {
                docRef.ref.update({isBanned: true})
            }
            else {
                docRef.ref.update({profanityStrike: docRef.data().profanityStrike-1})
            }
        })
    }

    return null;
});