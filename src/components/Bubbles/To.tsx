import styles from "./Bubbles.module.scss";

function To({ message }: any) {
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
