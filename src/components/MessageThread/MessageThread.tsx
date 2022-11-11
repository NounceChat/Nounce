import styles from "./MessageThread.module.scss"
import { useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import {auth} from "../../firebase-config";
import {query, where, collection, getDocs} from 'firebase/firestore';
import {db} from '../../firebase-config';

const MessageThread = ({chat}:any) => {
  const [user] = useAuthState(auth);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  useEffect(() => {
    if (user === null) return;

    setLastMessage(chat.messages[chat.messages.length-1]);
    if (lastMessage === null) return;

    if (lastMessage?.number === user?.phoneNumber) {
      setUserName('You');
      if (chat.isBatch) {
        setUserName('Announcement by You');
      }
      return
    }

    const q = query(collection(db, "phones"), where("number", "==", lastMessage?.number));
    getDocs(q).then((querySnapshot) => {
      const name = querySnapshot.docs[0].data().userName;
      if (chat.isBatch)
      {
        setUserName('Announcement by '+name);
        return;
      } 
        
      setUserName(name);
    })
    .catch((error) => {
      setUserName('Anonymous');
    })

  
  }, [user, chat, lastMessage]);

  const nav = useNavigate();
  const navigateToChat = () => {
      chat.isBatch ?
      nav('/announcement/'+chat.id)
      :
      nav(`/chat/${chat.id}`)
  }

  const avatar = `https://avatars.dicebear.com/api/identicon/${chat.id}.svg`

  return (
    <div id={styles.mssg_thread} onClick={navigateToChat}>
        <div className={styles.avatar}>
          <img src={avatar} alt="" />
        </div>

        <div className={styles.name_mssg}>
          <p className={styles.name}>
            {userName}
          </p>
          <p className={styles.mssg_preview}>
            {lastMessage?.body}
          </p>
        </div>

        <div className={styles.time}>
          <p>{lastMessage?.createdAt.toDate().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
    </div>
  )
}

export default MessageThread