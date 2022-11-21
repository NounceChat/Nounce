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

    useEffect(() => {
        if (user === null) return;
        const q = query(collection(db, "phones"), where("number", "==", user?.phoneNumber));
        onSnapshot(q, (docSnap) => {
            setIsBanned(docSnap.docs[0].data().isBanned);
        });
    }, [user])

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

    const sendOnEnter = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault
            sendChat(e);
        }
      };

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
           
                {
                    isBanned ?
                    <div className={styles.banned}>
                        <p>You are banned from sending messages</p>
                    </div>
                    :
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
                            <FontAwesomeIcon icon={faPaperPlane} color="white" />
                        </button>
                    </form>
                }
            </div>
            <div className={styles.navContainer}>
                <Navbar />
            </div>
        </div>
    );
}

export default Chat;