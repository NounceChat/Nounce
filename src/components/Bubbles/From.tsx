import { Message } from './../Interface/index';
import styles from "./Bubbles.module.scss";

function From({ message: message }: { message: Message }) {
  return (
    <div id={styles.fromBubble} className={styles.bubble}>
      <p className={styles.time}>
        {message?.createdAt.toDate().toLocaleTimeString()}
      </p>
      <p>{message.body}</p>
    </div>
  );
}

export default From;
