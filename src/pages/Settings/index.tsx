import styles from './Settings.module.scss';
import Header from "../../components/Header/Header";
import Navbar from "../../components//Navbar/Navbar";
import MaterialUISwitch from '../../components/darkMode/darkModeSwitch';
import {auth} from '../../firebase-config';
import { useNavigate } from 'react-router-dom';

import zild from "../../assets/img/zild.jpg"

function Settings() {
    const navigate = useNavigate();
    const logout  = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            auth.signOut();
            navigate("/login");
        }
    }
    return ( 
        <div id={styles.settings}>
            <Header />

            <div className={styles.switch_container}>
                <MaterialUISwitch sx={{ m: 1 }} size="medium" defaultChecked />
                <p>Dark Mode</p>
            </div>

            <div className={styles.settings_avatar}>
                <img src={zild} alt="" />
            </div>

            <div className={styles.settings_name}>
                <h3>Zild Benitez</h3>
            </div>

            <div className={styles.userInfo}>
                <form>
                    <label htmlFor="username">Username</label>
                    <input type="text" title="username" id={styles.userName} />

                    <label htmlFor="email">Email</label>
                    <input type="email" title="email" id={styles.Email} />

                    <label htmlFor="password">Password</label>
                    <input type="password" title="password" id={styles.PassWord} />

                </form>
            </div>
            
            <div className={styles.settings_buttons}>
                <button id={styles.edit}>Edit</button>
                <button id={styles.cancel}>Cancel</button>
                <button id={styles.save}>Save</button>
            </div>

            <div className={styles.signOut}>
                <button onClick={logout}>Sign Out</button>
            </div>

            <Navbar />
        </div> 
    );
}

export default Settings;