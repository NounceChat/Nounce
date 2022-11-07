import styles from "./MessageList.module.scss"
import MessageThread from "./MessageThread"
import { useEffect, useState} from 'react';
import {auth, db, functions} from '../../firebase-config';  
import {collection, addDoc,  query, where, getDocs, updateDoc, orderBy} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';

const MessageList = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [user] = useAuthState(auth);
  useEffect(() => {
    if (user === null) return;
    const messageRef= collection(db, "chats");
    const q = query(messageRef, where("participants", "array-contains", user?.phoneNumber), orderBy("createdAt", "desc"));  
    getDocs(q).then((querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        }
      })
      setChats(messages);
    })
  }, [user])
  
  return (
    <div id={styles.mssg_list}>
      {
        chats.length>0 ?  chats.map((message) => {
          return (
            <MessageThread key={message.id} chat={message} />
          )
        })
        : <p>No messages</p>
      }
    </div>
  )
}

export default MessageList