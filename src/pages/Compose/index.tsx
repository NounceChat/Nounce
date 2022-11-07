import styles from './Compose.module.scss'; 
import Header from "../../components/Header/Header";
import Navbar from "../../components//Navbar/Navbar";

import batchIcon from "../../assets/img/group.svg"

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
                        maxLength="160"
                        />

                        <div className={styles.submit_buttons}>
                            <button className={styles.submit_single}>Single SMS</button>
                            <button className={styles.submit_batch}>
                                <img src={batchIcon} alt="" />
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