import styles from './Chat.module.scss';
import From from "../../components/Bubbles/From";
import To from "../../components/Bubbles/To";
import ChatHeader from "../../components/ChatHeader";
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../firebase-config';
import { doc, onSnapshot, updateDoc, arrayUnion, query, getDocs, collection, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Navbar from '../../components/Navbar/Navbar';
import { CircularProgress } from '@mui/material';

import * as geofire from 'geofire-common';
import firebase from "firebase/compat/app"; 
import 'firebase/compat/firestore';

export type MyParams = {
    id: string;
};

function Chat() {
    const fieldRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatMate, setChatMate] = useState<string>('');
    const [chat, setChat] = useState<any>('');
    const [user] = useAuthState(auth);
    const { id } = useParams<keyof MyParams>() as MyParams;
    const [isBanned, setIsBanned] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [chatMateNumber, setChatMateNumber] = useState('');
    
    useEffect(() => {
        if (user === null) return;
        const q = query(collection(db, "phones"), where("number", "==", user?.phoneNumber));
        const phone = user?.phoneNumber ? user?.phoneNumber : '';
        const location = doc(db, "locations", phone);
        onSnapshot(location, (doc) => {
            if (doc.exists()) {
                setLatitude(doc.data().lat);
                setLongitude(doc.data().lng);
            }
        })
        onSnapshot(q, (docSnap) => {
            setIsBanned(docSnap.docs[0].data().isBanned);
        });
    }, [user])
    
    const getNearbyPhones = ()
    : Promise<string[]> => {
        // query location within a mile radius of user
        return new Promise((resolve, reject) => {
            const nearbyPhones: string[] = [];
            const radiusInM = 1609.34;
            const bounds = geofire.geohashQueryBounds([latitude, longitude], radiusInM);
            const promises = [];
            const db = firebase.firestore();
            for (const b of bounds) {
                const q:any = db.collection("locations")
                            .orderBy('geohash')
                            .startAt(b[0])
                            .endAt(b[1]);    

                promises.push(getDocs(q));
            }
            Promise.all(promises).then((snapshots) => {
                for (const snap of snapshots) {
                    for (const doc of snap.docs) {
                        const distanceInM = geofire.distanceBetween([latitude, longitude], [latitude, longitude]);
                        if (distanceInM <= radiusInM) {
                            nearbyPhones.push(doc.id);
                        }
                    }
                }
                resolve(nearbyPhones);
            });
        });
    }
    
    useEffect(() => {
        if (user === null) return;
        return onSnapshot(doc(db, "chats", id), (doc) => {
            if (doc.exists()) {
                if (doc.data().participants.length === 1) {
                    setIsWaiting(true);
                    return;
                }
                setIsWaiting(false);
                setMessages(doc.data().messages);
                setChatMateNumber(doc.data().participants[0] === user?.phoneNumber ? doc.data().participants[1] : doc.data().participants[0]);
                getDocs(query(collection(db, "phones"), where("number", "==", doc.data().participants.filter((user: any) => user !== auth.currentUser?.phoneNumber)[0])))
                .then((querySnapshot) => {
                    setChatMate(querySnapshot.docs[0].data().userName);
                })
                .catch((error) => {
                    setChatMate('Anonymous');
                    console.log("Error getting documents: ", error);
                })
            }
        });
    }, [user, id])

    useEffect(() => {
        fieldRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendChat = async (e: any) => {
        e.preventDefault();
        if (user === null || chat.length === 0) return;
        const nearbyPhones = await getNearbyPhones();
        if (!nearbyPhones.includes(chatMateNumber)) {
            setIsBlocked(true);
            return;
        }
        updateDoc(doc(db, "chats", id), {
            messages: arrayUnion({
                id: Math.random().toString(36).substring(7),
                number: user?.phoneNumber,
                body: chat,
                createdAt: new Date(),
            })
        });
        setChat('');
    }

    const sendOnEnter = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault
            sendChat(e);
        }
    };

    return (
        <div id={styles.chat}>
            <ChatHeader chatMate={chatMate} />
            {
                !isWaiting ? 
                <div id={styles.chatContainer}>
                    {
                        messages && messages.length > 0 ? messages.map((message) => {
                            if (message.number === user?.phoneNumber) {
                                return (
                                    <div key={message.id} className={styles.bubbleContainer}>
                                        <From message={message} />
                                    </div>
                                )
                            } else {
                                return (
                                    <div key={message.id} className={styles.bubbleContainer}>
                                        <To message={message} />
                                    </div>
                                )
                            }
                        }) : <p className={styles.no_messages}>No messages</p>
                    }
                    <div ref={fieldRef}></div>
            
                    {(() => {
                        if (isBanned) {
                            return (
                                <div className={styles.banned}>
                                    <p>You are banned from sending messages</p>
                                </div>
                            )
                        }
                        else if (isBlocked) {
                            return (
                                <div className={styles.blocked}>
                                    <p>Chatmate is no longer in range</p>
                                </div>
                            )
                        }
                        else {
                            return (
                                <form className={styles.sendContainer} onSubmit={sendChat}>
                                    <TextareaAutosize
                                        value={chat}
                                        onChange={(e) => setChat(e.target.value)}
                                        onKeyUp = {sendOnEnter}
                                        maxRows={4}
                                        minRows={1}
                                        placeholder="Type a message..."
                                        maxLength={160}
                                    />
                                    <button type="submit" >
                                        <FontAwesomeIcon icon={faPaperPlane} color="var(--color-group-2)" />
                                    </button>
                                </form>
                            )
                        }
                    })()}
                </div>
                : 
                <div className={styles.loading}>
                    <h1>Waiting for chatmate ...</h1>
                    <CircularProgress color="secondary" />
                </div>
            }
            <div className={styles.navContainer}>
                <Navbar />
            </div>
        </div>
    );
}

export default Chat;