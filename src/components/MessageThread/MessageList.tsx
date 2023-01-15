import styles from "./MessageList.module.scss";
import MessageThread from "./MessageThread";
import { Chatcontext } from "./Chatcontext";
import { useContext } from "react";

const MessageList = () => {
  const { chats } = useContext<any>(Chatcontext);
  return (
    <div id={styles.mssg_list}>
      {chats.length > 0 ? (
        chats.map((message:any) => {
          return <MessageThread key={message.id} chat={message} />;
        })
      ) : (
        <p>No messages</p>
      )}
    </div>
  );
};

export default MessageList;
