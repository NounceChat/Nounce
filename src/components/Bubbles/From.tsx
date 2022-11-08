import styles from './Bubbles.module.scss';

function From({message}:any) {
    return ( 
        <div id={styles.fromBubble} className={styles.bubble}>
            <p>{message.body}</p>
        </div>
    );
}

export default From;