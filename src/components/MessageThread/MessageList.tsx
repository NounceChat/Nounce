import styles from "./MessageList.module.scss"
import MessageThread from "./MessageThread"
import { useEffect, useState} from 'react';
import {auth, db} from '../../firebase-config';  
import {collection, query, where, orderBy, onSnapshot} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';

const MessageList = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [user] = useAuthState(auth);
  useEffect(() => {
    if (user === null) return;
    const messageRef= collection(db, "chats");
    const q = query(messageRef, where("participants", "array-contains", user?.phoneNumber));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chats:any[] = [];
      querySnapshot.forEach((doc) => 
        chats.push({...doc.data(), id: doc.id})
      );
      //order by last message
      chats.sort((chat) => {
        if (chat.messages.length === 0) return 0;
        return chat.messages[chat.messages.length-1].createdAt;
      });
      setChats(chats);
      console.log(chats);
    });
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