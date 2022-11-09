import styles from './Compose.module.scss'; 
import Header from "../../components/Header/Header";
import Navbar from "../../components//Navbar/Navbar";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';

const maxChar:number = 160

const autoAdjust = () => {
    // fixed https://bobbyhadz.com/blog/react-useref-object-is-possibly-null
    let textInput = document.getElementById('inputText') as HTMLInputElement
    if (textInput != null) {
        textInput.style.height = "auto"
        textInput.style.height = (textInput.scrollHeight)+"px"
    }
}
function Compose() {

    return ( 
        <div id={styles.compose}>
            <Header />

            <div className={styles.title}>
                <h1>Send a Message</h1>
            </div>

            <div className={styles.mssg_box}>
                    <form>
                        <textarea 
                        id='inputText'
                        placeholder='Message'
                        className={styles.textBox}
                        onKeyUp={autoAdjust}
                        onKeyDown={autoAdjust}
                        maxLength={maxChar}
                        />

                        <div className={styles.submit_buttons}>
                            <button className={styles.submit_single}>
                                <FontAwesomeIcon icon={faUser}/>
                                Single SMS
                                </button>
                            <button className={styles.submit_batch}>
                                <FontAwesomeIcon icon={faUserGroup}/>
                                Batch SMS
                            </button>
                        </div>
                    </form>
            </div>


            <Navbar />            
        </div>
     );
}

export default Compose;