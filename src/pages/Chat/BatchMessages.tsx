import styles from './Chat.module.scss';
import From from "../../components/Bubbles/From";
import To from "../../components/Bubbles/To";
import ChatHeader from "../../components/ChatHeader";
import Navbar from "../../components/Navbar/Navbar";
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../firebase-config';
import { doc, onSnapshot, } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useParams } from "react-router-dom";

export type MyParams = {
    id: string;
};

function BatchMessages() {
    const chatMate = 'Batch SMS by You';
    const fieldRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [user] = useAuthState(auth);
    const { id } = useParams<keyof MyParams>() as MyParams;
    const unsub = useEffect(() => {
        if (user === null) return;
        return onSnapshot(doc(db, "batch_messages", id), (doc) => {
            if (doc.exists()) {
                setMessages((messages) => {
                    const new_messages = messages.filter((message) => message.id !== id);
                    new_messages.unshift({
                        id: id,
                        body: doc.data().body,
                        createdAt: doc.data().createdAt,
                        number: doc.data().sender,
                    });
                    return new_messages;
                });
            }
            console.log(messages);
        });
    }, [user, id])

    useEffect(() => {
        fieldRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div id={styles.chat}>
            <ChatHeader chatMate={chatMate} />

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
            </div>
            <Navbar />
        </div>
    );
}


export default BatchMessages;