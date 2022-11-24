import styles from "./Bubbles.module.scss";

function From({ message }: any) {
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
