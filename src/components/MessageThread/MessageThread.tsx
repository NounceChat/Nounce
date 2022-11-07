import styles from "./MessageThread.module.scss"
import Grogu from "../../assets/img/Grogu.webp"
import { useEffect, useState} from 'react';

const MessageThread = ({chat}:any) => {
  const [lastMessage, setLastMessage] = useState<any>({
    body: "",
    createdAt: new Date(),
    number: ""
  });
  useEffect(() => {
    setLastMessage(chat.messages[chat.messages.length-1]);
  }, [])
  return (
    <div id={styles.mssg_thread}>
        <div className={styles.avatar}>
          <img src={Grogu} alt="" />
        </div>

        <div className={styles.name_mssg}>
          <p className={styles.name}>
            {lastMessage.number}
          </p>
          <div className={styles.mssg_preview}>
            {lastMessage.body}
          </div>
        </div>

        <div className={styles.time}>
          <p>{lastMessage.createdAt.toDate().toLocaleTimeString()}</p>
        </div>
    </div>
  )
}

export default MessageThread