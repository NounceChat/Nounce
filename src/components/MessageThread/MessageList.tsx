import { ChatInterface } from './../Interface/index';
import styles from "./MessageList.module.scss";
import MessageThread from "./MessageThread";
import { Chatcontext } from "./Chatcontext";
import { useContext, useEffect} from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase-config";
import { CollectionReference } from "firebase/firestore";

const MessageList = () => {
  const [user] = useAuthState(auth);
  const { chats, setChats } = useContext<any>(Chatcontext);

  const sortChats = (chats: ChatInterface[]) => {
    return chats.sort((a, b) => {
      if (a.messages.length == 0 || b.messages.length == 0) return 0;

      const a_timestamp: number = Number(a.messages[a.messages.length - 1].createdAt);
      const b_timestamp: number = Number(b.messages[b.messages.length - 1].createdAt);
      return b_timestamp - a_timestamp;
    });
  };

  const ChatsEventListener = () => {
    const messageRef = collection(db, "chats");
    const q = query(
      messageRef,
      where("participants", "array-contains", user?.phoneNumber)
    );
  
    return onSnapshot(q, (querySnapshot) => {
      const chats: ChatInterface[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data() && doc.data().messages.length > 0)
          chats.push({ 
            id: doc.id, 
            isBatch: false,
            messages: doc.data().messages,
            participants: doc.data().participants
          });
      });
      setChats(sortChats(chats));
    });
  };

  const BatchMessagesEventListener = (batch_messages_ref:CollectionReference) => {
    const batch_messages_q = query(
      batch_messages_ref,
      where("sender", "==", user?.phoneNumber)
    );

    return onSnapshot(batch_messages_q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const new_chat = {
          id: doc.id,
          messages: [
            {
              id: doc.id,
              body: doc.data().body,
              createdAt: doc.data().createdAt,
              number: doc.data().sender,
            },
          ],
          isBatch: true,
          participants: [user?.phoneNumber, doc.data().sender],
        };
        setChats((chats: ChatInterface[]) => {
          const new_chats = chats.filter((chat) => chat.id !== new_chat.id);
          new_chats.unshift(new_chat);
          sortChats(new_chats);
          return new_chats;
        });
      });
    });
  };


  const BatchMessagesReceivedEventListener = (batch_messages_ref:CollectionReference) => {
    const batch_messages_received_q = query(
      batch_messages_ref,
      where("recipients", "array-contains", user?.phoneNumber)
    );

    return onSnapshot(batch_messages_received_q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const new_chat = {
          id: doc.id,
          messages: [
            {
              id: doc.id,
              body: doc.data().body,
              createdAt: doc.data().createdAt,
              number: doc.data().sender,
            },
          ],
          isBatch: true,
          participants: [user?.phoneNumber, doc.data().sender],
        };

        setChats((chats: ChatInterface[]) => {
          const new_chats = chats.filter(
            (chat: ChatInterface) => chat.id !== new_chat.id
          );
          new_chats.unshift(new_chat);
          sortChats(new_chats);
          return new_chats;
        });
      });
    });
  };

  useEffect(() => {
    if (user === null)
      return;

    // querySnapshots for getting chats
    const chatsEventListener = ChatsEventListener();        
    const batch_messages_ref = collection(db, "announcements");
    const batch_messages_listener = BatchMessagesEventListener(batch_messages_ref);
    const batch_messages_received_listener = BatchMessagesReceivedEventListener(batch_messages_ref);
  }, [user]);

  return (
    <div id={styles.mssg_list}>
      {chats.length > 0 ? (
        chats.map((message: ChatInterface) => {
          return <MessageThread key={message.id} chat={message} />;
        })
      ) : (
        <p>No messages</p>
      )}
    </div>
  );
};

export default MessageList;
