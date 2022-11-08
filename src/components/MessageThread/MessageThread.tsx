import styles from "./MessageThread.module.scss"
import Grogu from "../../assets/img/Grogu.webp"
import { useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

const MessageThread = ({chat}:any) => {
  const [lastMessage, setLastMessage] = useState<any>(null);
  useEffect(() => {
    setLastMessage(chat.messages[chat.messages.length-1]);
  }, [])
  const nav = useNavigate();
  return (
    <div id={styles.mssg_thread} onClick={() => nav("chat/"+chat?.id)}>
        <div className={styles.avatar}>
          <img src={Grogu} alt="" />
        </div>

        <div className={styles.name_mssg}>
          <p className={styles.name}>
            {lastMessage?.number}
          </p>
          <div className={styles.mssg_preview}>
            {lastMessage?.body}
          </div>
        </div>

        <div className={styles.time}>
          <p>{lastMessage?.createdAt.toDate().toLocaleTimeString()}</p>
        </div>
    </div>
  )
}

export default MessageThread