import styles from "./Bubbles.module.scss";
import { Message } from "../../components/Interface/index";

function To({ message : message }: { message: Message }) {
  return (
    <div id={styles.toBubble} className={styles.bubble}>
      <p className={styles.time}>
        {message?.createdAt.toDate().toLocaleTimeString()}
      </p>
      <p>{message.body}</p>
    </div>
  );
}

export default To;
