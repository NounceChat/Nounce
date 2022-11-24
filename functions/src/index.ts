import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

exports.matchmaker = functions.database.ref('matchmaking/{userId}')
    .onCreate((snap, context) => {
        const database = admin.database();
        // Generates new Chat ID
        const generateChatId = () => {
            var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var chatId = "";
            for (let j = 0; j < 20; j++) chatId += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
            return chatId;
        }

        const chatId = generateChatId();

        database.ref('matchmaking').once('value').then(users => {
            let secondPlayer: any = null;
            users.forEach(user => {
                if (user.val().chatId === "placeholder" && user.key !== context.params.userId) {
                    secondPlayer = user;
                }
            });

            if (secondPlayer === null) return null;

            database.ref("matchmaking").transaction(function (matchmaking) {
                // If any of the players gets into another game during the transaction, abort the operation
                if (matchmaking === null || matchmaking[context.params.userId].chatId !== "placeholder" || matchmaking[secondPlayer.key].chatId !== "placeholder")
                    return matchmaking;
                matchmaking[context.params.userId].chatId = chatId;
                matchmaking[secondPlayer.key].chatId = chatId;
                return matchmaking;
            }).then(async (result) => {
                if (result.snapshot.child(context.params.userId).val().chatId !== chatId) return;

                const chat = {
                    createdAt: new Date(),
                    messages: [
                        {
                            id: Math.random().toString(36).substring(7),
                            createdAt: new Date(),
                            number: context.params.userId,
                            body: result.snapshot.child(context.params.userId).val().message
                        },
                        {
                            id: Math.random().toString(36).substring(7),
                            createdAt: new Date(),
                            number: secondPlayer.key,
                            body: secondPlayer.val().message,
                        }
                    ],
                    participants: [context.params.userId, secondPlayer.val().userId]
                }

                //write on firestore
                await admin.firestore().collection('chats').doc(chatId).set(chat)
                await admin.firestore().collection('phones').doc(context.params.userId).update({
                    newChatId: chatId
                })
                await admin.firestore().collection('phones').doc(secondPlayer.val().userId).update({
                    newChatId: chatId
                })
                //delete from matchmaking
                await admin.database().ref('matchmaking').child(context.params.userId).remove()
                await admin.database().ref('matchmaking').child(secondPlayer.key).remove()
                return null;
            }).catch(error => {
                console.log(error);
            });
            return null;
        }).catch(error => {
            console.log(error);
        });
    });

// listen for new announcements and filter bad words
export const filterBadWordsAnnouncements = functions.firestore.document("announcements/{announcementId}").onCreate(async (snap, context) => {
    const Filter = await require('bad-words');
    const announcement = snap.data();
    const filter = new Filter();
    const announcementText = announcement?.body
    if (filter.isProfane(announcementText)) {
        const filteredBody = filter.clean(announcementText);
        await snap.ref.update({ body: filteredBody });
        //get phone with number of announcement.sender and update phone isBanned to true
        admin.firestore().collection("phones").where("number", "==", announcement?.sender).get()
            .then((querySnapshot) => {
                const docRef = querySnapshot.docs[0];
                if (docRef.data().profanityStrike <= 0) {
                    docRef.ref.update({ isBanned: true })
                }
                else {
                    docRef.ref.update({ profanityStrike: docRef.data().profanityStrike - 1 })
                }
            })
    }
    return null;
});