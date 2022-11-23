import styles from './Compose.module.scss';
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { auth, db, functions } from '../../firebase-config';
import { collection, addDoc, query, where, getDocs, onSnapshot, updateDoc, limit, doc, arrayUnion, deleteDoc, runTransaction } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import CircularProgress from '@mui/material/CircularProgress';
import { httpsCallable } from 'firebase/functions';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Alert from '@mui/material/Alert';

import * as geofire from 'geofire-common';
import firebase from "firebase/compat/app"; 
import 'firebase/compat/firestore';

function Compose() {
    const maxChar: number = 160
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [message, setMessage] = useState('')
    const [isBatchMessage, setIsBatchMessage] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isBanned, setIsBanned] = useState(false);
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);

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
            const radiusInM = 1609;
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
                    for (const doc of snap.docs as Array<any>) {
                        const lat = doc.get('lat');
                        const lng = doc.get('lng');
                        const distanceInKm = geofire.distanceBetween([lat, lng], [latitude, longitude]);
                        const distanceInM = distanceInKm * 1000;
                        if (distanceInM <= radiusInM) {
                            nearbyPhones.push(doc.id);
                        }
                    }
                }
                resolve(nearbyPhones);
            });
        });
    }

    const submitBatch = async () => {
        try {
            if (latitude === 0 || longitude === 0) {
                setIsError(true);
                return;
            }
            setIsLoading(true);
            setIsBatchMessage(true);
            getNearbyPhones()
                .then(async (matchingDocs) => {
                    return await addDoc(collection(db, "announcements"), {
                        recipients: matchingDocs,
                        sender: user?.phoneNumber,
                        body: message,
                        createdAt: new Date()
                    });
                }).then((announcements) => {
                    navigate(`/announcement/${announcements?.id}`);
                    setMessage('');
                    setIsLoading(false);
                })
        }
        catch (e) {
            setIsLoading(false);
            setIsError(true);
            console.error("Error adding document: ", e);
        }
    }

    const findMatchFirstArriver = async (message: string) => {
        return await runTransaction(db, async (transaction) => {
            const roomRef = doc(db, "waitingRoom", "firstArriver");
            const docSnap = await transaction.get(roomRef);
            const chatRef = await addDoc(collection(db, "chats"), {
                messages: [{
                    body: message,
                    number: user?.phoneNumber,
                    createdAt: new Date(),
                    id: Math.random().toString(36).substring(7)
                }],
                createdAt: new Date(),
                participants: [user?.phoneNumber]
            });

            if (!docSnap.exists()) {
                await transaction.set(roomRef, {
                    chats: [{
                        sender: user?.phoneNumber,
                        message: message,
                        chat: chatRef.id,
                    }],
                    users: [user?.phoneNumber]
                });
                return chatRef.id;
            }

            deleteDoc(chatRef);
            return Promise.reject("Room already exists");
        })
    }

    const findChatSecondArriver = async (message: string) => {
        return await runTransaction(db, async (transaction) => {
            const roomRef = doc(db, "waitingRoom", 'firstArriver');
            const docSnap = await transaction.get(roomRef);
            if (docSnap.exists() && docSnap.data()?.users.length === 1) {
                const chatId = docSnap.data()?.chats[0].chat;
                await updateDoc(doc(db, "chats", chatId), {
                    participants: arrayUnion(user?.phoneNumber),
                    messages: arrayUnion({
                        body: message,
                        number: user?.phoneNumber,
                        createdAt: new Date(),
                        id: Math.random().toString(36).substring(7)
                    })
                });

                await transaction.delete(roomRef);
                return chatId;
            }

            return Promise.reject("Waiting Room is already full");
        })
    }

    const findChat = (e: string) => {
        return new Promise(async (resolve, reject) => {
            const queueRef = query(collection(db, "waitingRoom"));
            const getDocsSnap = await getDocs(queueRef)
            const room = getDocsSnap.docs[0];
            if (!room || room === undefined) {
                resolve(findMatchFirstArriver(e));
            } else {
                resolve(findChatSecondArriver(e));
            }
        });
    }

    const submitSingleChat = async () => {
        if (latitude === 0 || longitude === 0) {
            setIsError(true);
            return;
        }

        setIsLoading(true);
        setIsBatchMessage(false);

        findChat(message)
            .then((chatId) => {
                setMessage('');
                setIsLoading(false);
                navigate(`/chat/${chatId}`);
            })
            .catch((e) => {
                setIsLoading(false);
                setIsError(true);
                console.error("Error adding document: ", e);
            })
    }

    const inputChange = (e: any) => {
        setMessage(e.target.value)
        if (e.target.value.length > maxChar || e.target.value.length === 0) {
            setBtnDisabled(true)
            return
        }
        setBtnDisabled(false)
    }

    return (
        <div id={styles.compose}>
            <Header />
            {isError ?
                <Alert className={styles.error} severity="error" onClose={() => { setIsError(false) }}>
                    We're having trouble finding someone around you. Please try again. Make sure you have location services enabled.
                </Alert>
                : null
            }

            {isLoading ?
                <div className={styles.loading}>
                    {isBatchMessage ?
                        <h1>Sending Announcement ..</h1>
                        :
                        <h1>Searching for a Chatmate...</h1>
                    }
                    <CircularProgress color="secondary" />
                </div>
                :
                <>
                    {!isBanned ?
                        <div className={styles.container}>
                            <div className={styles.title}>
                                <h1>Send a Message in your Area</h1>
                            </div>

                            <div className={styles.mssg_box}>
                                <div className={styles.form}>
                                    <TextareaAutosize
                                        value={message}
                                        onChange={inputChange}
                                        className={styles.textBox}
                                        maxLength={maxChar}
                                        minRows={2}
                                        maxRows={6}
                                        placeholder='Message'
                                    />

                                    <div className={styles.submit_buttons}>
                                        <button disabled={btnDisabled} className={styles.submit_single} onClick={submitSingleChat}>
                                            <FontAwesomeIcon icon={faUser} />
                                            Single Chat
                                        </button>
                                        <button disabled={btnDisabled} className={styles.submit_batch} onClick={submitBatch}>
                                            <FontAwesomeIcon icon={faUserGroup} />
                                            Announce
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div className={styles.banned}>
                            <h3>You have been banned from using this service.</h3>
                        </div>
                    }
                </>
            }
            <Navbar />
        </div>
    );
}

export default Compose;