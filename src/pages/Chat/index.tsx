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
    const unsub = useEffect(() => {
        if (user === null) return;

        return onSnapshot(doc(db, "chats", id), (doc) => {
            if (doc.exists()) {
                setMessages(doc.data().messages);
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
            <form className={styles.sendContainer} onSubmit={sendChat}>
                <TextareaAutosize
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    maxRows={4}
                    minRows={1}
                    placeholder="Type a message..."
                    maxLength={160}
                />
                <button type="submit" >
                    <FontAwesomeIcon icon={faPaperPlane} color="white" />
                </button>
            </form>
        </div>
    );
}

export default Chat;