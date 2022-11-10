import styles from "./MessageThread.module.scss"
import { useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import {auth} from "../../firebase-config";

const MessageThread = ({chat}:any) => {
  const [user] = useAuthState(auth);
  const [lastMessage, setLastMessage] = useState<any>(null);
  useEffect(() => {
    setLastMessage(chat.messages[chat.messages.length-1]);
  }, [])
  const nav = useNavigate();
  const navigateToChat = () => {
    chat.participants[0] === chat.participants[1]?
      nav('/batch_chat/'+chat.id)
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
          {
              lastMessage?.number === user?.phoneNumber?
              <p className={styles.name}>You</p>
              :
              <p className={styles.name}>
                {lastMessage?.number}
              </p>
          }
          <div className={styles.mssg_preview}>
            {lastMessage?.body}
          </div>

        </div>

        <div className={styles.time}>
          <p>{lastMessage?.createdAt.toDate().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
    </div>
  )
}

export default MessageThread