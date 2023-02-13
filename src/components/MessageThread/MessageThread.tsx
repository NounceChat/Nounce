import styles from "./MessageThread.module.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase-config";
import { query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";
import { ChatInterface, Message } from "../../components/Interface/index";

const MessageThread = ({ chat }: {chat: ChatInterface}) => {
  const [user] = useAuthState(auth);
  const [lastMessage, setLastMessage] = useState<Message|null>(null);
  const [userName, setUserName] = useState<string>("Anonymous");
  const [avatar, setAvatar] = useState<string>("https://avatars.dicebear.com/api/initials/Anonymous.svg");

  useEffect(() => {
    setLastMessage(chat.messages[chat.messages.length - 1]);
    if (user === null || lastMessage === null) return;

    if (lastMessage?.number === user?.phoneNumber) {
      if (chat.isBatch) {
        setUserName("Announcement by You");
        setAvatar(`https://avatars.dicebear.com/api/identicon/${chat.id}.svg`);
      } else {
        const other_user: string= chat.participants.filter(
          (participant: string) => participant !== user?.phoneNumber
        )[0];
        if (other_user === undefined) return;
        const other_userName = query(
          collection(db, "phones"),
          where("number", "==", other_user)
        );
        getDocs(other_userName).then((querySnapshot) => {
          const other_userName_data = querySnapshot.docs[0]?.data().userName;
          if (other_userName_data !== undefined) 
          {
            setAvatar(
              `https://avatars.dicebear.com/api/initials/${other_userName_data}.svg`
            );
          }
        });
        setUserName("You");
      }
      return;
    }

    const q = query(
      collection(db, "phones"),
      where("number", "==", lastMessage?.number)
    );
    getDocs(q)
      .then((querySnapshot) => {
        const name = querySnapshot.docs[0].data().userName;
        if (chat.isBatch) {
          setUserName("Announcement by " + name);
          setAvatar(
            `https://avatars.dicebear.com/api/identicon/${chat.id}.svg`
          );
          return;
        }

        setUserName(name);
        setAvatar(`https://avatars.dicebear.com/api/initials/${name}.svg`);
      })
      .catch(() => {
        setUserName("Anonymous");
      });
  }, [user, chat, lastMessage]);

  const nav = useNavigate();
  const navigateToChat = () => {
    chat.isBatch ? nav("/announcement/" + chat.id) : nav(`/chat/${chat.id}`);
  };

  const dateFormat = (date: Date) => {
    const d = new Date(date); //date created
    const now = new Date();

    const dTime = d.getTime();
    const nowTime = now.getTime();
    const timeDiff = nowTime - dTime; // time elapsed since message creation

    // conversion factors
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = week * 52;

    //range in miliseconds
    if (timeDiff < 86400 * 1000) {
      return lastMessage?.createdAt
        .toDate()
        .toLocaleTimeString(navigator.language, {
          hour: "2-digit",
          minute: "2-digit",
        });
    } else if (timeDiff > 86400 * 1000 && timeDiff < 604800 * 1000) {
      return `${Math.floor(timeDiff / day)} d`;
    } else if (timeDiff > 604800 * 1000 && timeDiff < 2628288 * 1000) {
      return `${Math.floor(timeDiff / week)} w`;
    } else if (timeDiff > 2628288 * 1000 && timeDiff < 31556926 * 1000) {
      return `${Math.floor(timeDiff / month)} mo`;
    } else if (timeDiff > 31556926 * 1000) {
      return `${Math.floor(timeDiff / year)} y`;
    }
  };

  return (
    <div id={styles.mssg_thread} onClick={navigateToChat}>
      <div className={styles.avatar}>
        <img src={avatar} alt="" />
      </div>

      <div className={styles.name_mssg}>
        <p className={styles.name}>{userName}</p>
        <p className={styles.mssg_preview}>
          {lastMessage?.number === user?.phoneNumber
            ? `You: ${lastMessage?.body}`
            : lastMessage?.body}
        </p>
      </div>

      <div className={styles.time}>
        <p>
          {
            lastMessage ?
            dateFormat(lastMessage.createdAt.toDate())
            : ""
          }
        </p>
      </div>
    </div>
  );
};

export default MessageThread;
