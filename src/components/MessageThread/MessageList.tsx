import styles from "./MessageList.module.scss"
import MessageThread from "./MessageThread"
import { useEffect, useState} from 'react';
import {auth, db} from '../../firebase-config';  
import {collection, query, where, orderBy, onSnapshot} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';

const MessageList = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [user] = useAuthState(auth);
  const sortChats = (chats:any[])  => {
      return chats.sort((a, b) => {
        const a_timestamp = a.messages[a.messages.length - 1].createdAt;
        const b_timestamp = b.messages[b.messages.length - 1].createdAt;
        return b_timestamp - a_timestamp;
      });
  }
  useEffect(() => {
    if (user === null) return;
    const messageRef= collection(db, "chats");
    const q = query(messageRef, where("participants", "array-contains", user?.phoneNumber));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chats:any[] = [];
      querySnapshot.forEach((doc) => 
        chats.push({...doc.data(), id: doc.id})
      );
      setChats(sortChats(chats));
    });

    const batch_messages_ref = collection(db, "batch_messages");
     const batch_messages_q = query(batch_messages_ref, where("sender", "==", user?.phoneNumber));
    const batch_messages_unsubscribe = onSnapshot(batch_messages_q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const new_chat = {
          id: doc.id,
          messages: [{
            id: doc.id,
            body: doc.data().body,
            createdAt: doc.data().createdAt,
            number: doc.data().sender,
          }],
          participants: [user?.phoneNumber, doc.data().sender], 
        }
        setChats((chats) => {
          const new_chats = chats.filter((chat) => chat.id !== new_chat.id);
          new_chats.unshift(new_chat);
          sortChats(new_chats);
          return new_chats;
        });
      });
    });
  }, [user])
  
  return (
    <div id={styles.mssg_list}>
      {
        chats.length >0 ?  chats.map((message) => {
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