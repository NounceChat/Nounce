import styles from './Chat.module.scss';
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import From from "../../components/Bubbles/From";
import To from "../../components/Bubbles/To";
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { useEffect, useState} from 'react';
import {auth, db} from '../../firebase-config';  
import {collection, query, doc, getDocs, orderBy, onSnapshot} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';
import {useParams} from "react-router-dom";

export type MyParams = {
  id: string;
};

function Chat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [user] = useAuthState(auth);
    const {id} = useParams<keyof MyParams>() as MyParams;
    useEffect(() => {
        if (user === null) return;

        const unsub = onSnapshot(doc(db, "chats", id), (doc) => {
            if (doc.exists()) 
            {
                console.log(doc.data())
                setMessages(doc.data().messages);
            }
        });
        return unsub;
    }, [user, id])
    
    return ( 
        <div id="chat">
            <Header />
            <div id={styles.chatContainer}>
                {
                    messages && messages.length>0 ?  messages.map((message) => {
                        if (message.number === user?.phoneNumber) {
                            return (
                                <div key={message.id} className={styles.bubbleContainer}>
                                    <From message={message}/> 
                                </div>
                            )
                        } else {
                            return (
                                <div key={message.id} className={styles.bubbleContainer}>
                                    <To message={message}/>
                                </div>
                            )
                        }
                    }) : <p>No messages</p>
                }

                <TextareaAutosize
                maxRows={4}
                aria-label="maximum height"
                placeholder="Maximum 4 rows"
                defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua."
                style={{ width: 200 }}
                />                
            </div>
            <Navbar />            
        </div>
     );
}

export default Chat;