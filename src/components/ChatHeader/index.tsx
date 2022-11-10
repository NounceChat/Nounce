import styles from './ChatHeader.module.scss'
import Grogu from "../../assets/img/Grogu.webp"
import {useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { MyParams } from '../../pages/Chat';

function ChatHeader({chatMate}:any) {
    const navigate = useNavigate();

    const { id } = useParams<keyof MyParams>() as MyParams;

    const avatar = `https://avatars.dicebear.com/api/identicon/${id}.svg`

    return ( 
        <div id={styles.chatHeader}>
            <div className={styles.chatInfo}>
                <img src={avatar} title='avatar' /> 
                <p>{chatMate}</p>
            <button onClick={() => navigate("/")}>
                <FontAwesomeIcon icon={faChevronLeft} color="white"/>
            </button>
            </div>
        </div>
    );
}

export default ChatHeader;