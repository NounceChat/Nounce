import styles from './Compose.module.scss'; 
import Header from "../../components/Header/Header";
import Navbar from "../../components//Navbar/Navbar";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';

const maxChar:number = 160

function Compose() {
    function autoAdjust(){
        let textInput = document.getElementById('inputText')
        textInput.style.height = "auto"
        textInput.style.height = (textInput.scrollHeight)+"px"
    }

    return ( 
        <div id={styles.compose}>
            <Header />

            <div className={styles.title}>
                <h1>Send a Message</h1>
            </div>

            <div className={styles.mssg_box}>
                    <form>
                        <textarea type="text"
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