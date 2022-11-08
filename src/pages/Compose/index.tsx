import styles from './Compose.module.scss'; 
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useState} from 'react';
import {useNavigate} from "react-router-dom";
import {auth, db, functions} from '../../firebase-config';  
import {collection, addDoc,  query, where, getDocs, onSnapshot, updateDoc, limit, doc, arrayUnion} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';
import CircularProgress from '@mui/material/CircularProgress';
import {httpsCallable} from 'firebase/functions';
import TextareaAutosize from '@mui/base/TextareaAutosize';

function Compose() {
    const maxChar:number = 160
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [message, setMessage] = useState('')
    const submitBatch = async () => {
        try{
            setIsLoading(true);
            const messageRef= collection(db, "phones");
            const q = query(messageRef, where("isOptedIn", "==", true), where("number", "!=", user?.phoneNumber), limit(1)); 
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                addDoc(collection(db, "batch_messages"), {
                        to: doc.data().number,
                        sender: user?.phoneNumber, 
                        body: message,
                        createdAt: new Date()
                    });
            });
            setIsLoading(false);
        }
        catch (e) {
            setIsLoading(false);
            console.error("Error adding document: ", e);
        }
    }
    const submitSingleChat = () => {
        setIsLoading(true);
        addDoc(collection(db, "queue"), {
            number: user?.phoneNumber,
        });
        const queueChat = httpsCallable(functions, 'queueChat');
        queueChat().then((result) => {
            const data = result.data;
            if (typeof data === "string") {
                updateDoc(doc(db, "chats", data), {
                    messages: arrayUnion({
                        id: Math.random().toString(36).substring(7),
                        number: user?.phoneNumber,
                        body: message, 
                        createdAt: new Date(),
                    }) 
                });
                navigate(`/chat/${data}`);
            }
            if(data === null) {
                const messageRef= collection(db, "chats");
                const q = query(messageRef, where("participants", "array-contains", user?.phoneNumber));
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    querySnapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            updateDoc(doc(db, "chats", change.doc.id), {
                                messages: arrayUnion({
                                    id: Math.random().toString(36).substring(7),
                                    number: user?.phoneNumber,
                                    body: message, 
                                    createdAt: new Date(),
                                }) 
                            });
                            navigate(`/chat/${change.doc.id}`);
                        }
                    });
                });
                unsubscribe();
            }
            setIsLoading(false);
        })
        .catch((e) => {
            setIsLoading(false);
            console.log(e.message);
        })
    }

    const inputChange = (e:any) => {
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
            { isLoading ? 
            <CircularProgress color="secondary"/>
            : 
            <>
                <div className={styles.title}>
                    <h1>Send a Message</h1>
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
                                <FontAwesomeIcon icon={faUser}/>
                                Single Chat
                                </button>
                            <button disabled={btnDisabled} className={styles.submit_batch} onClick={submitBatch}>
                                <FontAwesomeIcon icon={faUserGroup}/>
                                Batch SMS
                            </button>
                        </div>
                    </div>
                </div>
            </>
        }
            <Navbar />
        </div>
     );
}

export default Compose;