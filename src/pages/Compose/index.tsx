import styles from './Compose.module.scss'; 
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useState} from 'react';
import {useNavigate} from "react-router-dom";
import {auth, db, functions} from '../../firebase-config';  
import {collection, addDoc,  query, where, getDocs, onSnapshot, updateDoc, limit, doc, arrayUnion, deleteDoc} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';
import CircularProgress from '@mui/material/CircularProgress';
import {httpsCallable} from 'firebase/functions';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Alert from '@mui/material/Alert';

function Compose() {
    const maxChar:number = 160
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [message, setMessage] = useState('')
    const [isBatchMessage, setIsBatchMessage] = useState(false);
    const [isError, setIsError] = useState(false);
    const submitBatch = async () => {
        try{
            setIsLoading(true);
            setIsBatchMessage(true);
            const messageRef= collection(db, "phones");
            const q = query(messageRef, where("isOptedIn", "==", true), where("number", "!=", user?.phoneNumber)); 
            const querySnapshot = await getDocs(q);
            const numbers = querySnapshot.docs.map(doc => doc.data().number);
            
            const announcements = await addDoc(collection(db, "announcements"), {
                    recipients: numbers,
                    sender: user?.phoneNumber, 
                    body: message,
                    createdAt: new Date()
            });
            navigate(`/announcement/${announcements?.id}`);
            setMessage('');
            setIsLoading(false);
        }
        catch (e) {
            setIsLoading(false);
            setIsError(true);
            console.error("Error adding document: ", e);
        }
    }
    const submitSingleChat = async () => {
        setIsLoading(true);
        setIsBatchMessage(false);
        const queueRef = collection(db, "queue");
        const queueAdded = await addDoc(queueRef, {
            number: user?.phoneNumber,
        });
        const dateNow = new Date();

        //wait until queue size is two or less
        const q = query(queueRef, where("number", "==", user?.phoneNumber), limit(2));
        const unsubscribe1 = onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.docs.length <= 2) {
                unsubscribe1();          
                const queueChat = httpsCallable(functions, 'queueChat');
                queueChat({phoneNumber: user?.phoneNumber}).then((result:any) => {
                    if (result.data == null) {
                        // await until document is with query is created
                        const q = query(collection(db, "chats"), where("participants", "array-contains", user?.phoneNumber));
                        const unsubscribe = onSnapshot(q, (querySnapshot) => {
                            for(let doc of querySnapshot.docs) {
                                if (doc.data().createdAt.toDate() > dateNow && doc.data().participants.length == 2) {
                                    updateDoc(doc.ref , {
                                        messages: arrayUnion({
                                            id: Math.random().toString(36).substring(7),
                                            number: user?.phoneNumber,
                                            body: message, 
                                            createdAt: new Date(),
                                        })
                                    });
                                    unsubscribe();
                                    setMessage('');
                                    setIsLoading(false);
                                    navigate(`/chat/${doc.id}`);
                                }
                            }
                            const new_chats:any = [];
                            querySnapshot.forEach((doc) =>{
                            })
                            if (new_chats.length === 1) {
                            }
                        });
                    }
                    else {
                        const chatRef = doc(db, "chats", result.data);
                        updateDoc(chatRef, {
                            messages: arrayUnion({
                                id: Math.random().toString(36).substring(7),
                                number: user?.phoneNumber,
                                body: message, 
                                createdAt: new Date(),
                            })
                        });
                        setMessage('');
                        navigate(`/chat/${result.data}`);
                        setIsLoading(false);
                    }
                })
                .catch(async (e) => {
                    //remove added doc from queueAdded
                    await deleteDoc(doc(db, "queue", queueAdded.id));
                    setIsLoading(false);
                    setIsError(true);
        
                    console.log(e.message);
                })
            }
        });
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
        { isError ? 
                <Alert severity="error" onClose={() => {setIsError(false)}}>
                    We're having trouble finding someone around you. Please try again.
                </Alert> 
                : null
            }

            { isLoading ? 
                <div className={styles.loading}>
                    {isBatchMessage ?
                    <h1>Sending Announcement ..</h1>
                    : 
                    <h1>Searching for a Chatmate...</h1>
                    }
                    <CircularProgress color="secondary"/>
                </div>
            : 
            <>
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
                                <FontAwesomeIcon icon={faUser}/>
                                Single Chat
                                </button>
                            <button disabled={btnDisabled} className={styles.submit_batch} onClick={submitBatch}>
                                <FontAwesomeIcon icon={faUserGroup}/>
                                Announce
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