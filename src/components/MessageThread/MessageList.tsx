import styles from "./MessageList.module.scss"
import MessageThread from "./MessageThread"

const MessageList = () => {
  return (
    <div id={styles.mssg_list}>
        <MessageThread/>
        <MessageThread/>
        <MessageThread/>
        <MessageThread/>
        <MessageThread/>
        <MessageThread/>
        <MessageThread/>
        <MessageThread/>
    </div>
  )
}

export default MessageList