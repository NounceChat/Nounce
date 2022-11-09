import {useState} from 'react';

import styles from './Settings.module.scss';
import Header from "../../components/Header/Header";
import Navbar from "../../components//Navbar/Navbar";
import MaterialUISwitch from '../../components/darkMode/darkModeSwitch';
import {auth} from '../../firebase-config';
import { useNavigate } from 'react-router-dom';

import zild from "../../assets/img/zild.jpg"

function Settings() {

    const [showEdit, toggleEdit] = useState(false)

    const allowEdit = () => {
        toggleEdit(!showEdit)
    }

    const emailInfo = 'zild@gmail.com'
    const usernameInfo = 'Zild Benitez'
    const passwordInfo = 'medisina'

    const [userInfo, setUserInfo] = useState({
        username: usernameInfo,
        email: emailInfo,
        password: passwordInfo
    })


    const formValid = ():boolean => {
        let myForm = document.getElementById('myForm') as HTMLInputElement
        let userNameInput = document.getElementById('userName') as HTMLInputElement
        let emailInput = document.getElementById('email') as HTMLInputElement
        let passInput = document.getElementById('password') as HTMLInputElement
    
        if (userNameInput != null && emailInput != null && passInput != null ) {
        let username_data = userNameInput.value
        let email_data = emailInput.value
        let password_data = passInput.value

        console.log(`Form: ${myForm.checkValidity()}`)
        
        if (myForm.checkValidity() == true) {
                console.log(`Hide button: ${showEdit}`)
        
                setUserInfo({
                    username: username_data,
                    email: email_data,
                    password: password_data
                })
            return true
            }
        }
    return false
    }

    const revertBack = () => {
        let userNameInput = document.getElementById('userName') as HTMLInputElement
        let emailInput = document.getElementById('email') as HTMLInputElement
        let passInput = document.getElementById('password') as HTMLInputElement
        

        if (userNameInput != null && emailInput != null && passInput != null ) {
            userNameInput.value = usernameInfo
            emailInput.value = emailInfo
            passInput.value = passwordInfo
        }
    }

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
                {/* <Switch color='primary'/> */}
                <p>Dark Mode</p>
            </div>

            <div className={styles.setting_avatar}>
                <img src={zild} alt="" />
            </div>

            <div className={styles.setting_name}>
                <h3>{userInfo.username}</h3>
            </div>

            <div className={styles.userInfo}>
                <form onSubmit={(e) => {e.preventDefault()}} id='myForm'>
                    <div className={styles.inputFields}>
                        <label htmlFor="username">Username</label>
                        <input type="text" 
                        title="username"
                        className={styles.userName}
                        id='userName'
                        required
                        disabled = {!showEdit}
                        defaultValue={userInfo.username} // user info
                        />
                        
                        {/* https://stackoverflow.com/questions/41736213/why-cant-i-change-my-input-value-in-react-even-with-the-onchange-listener */}

                        <label htmlFor="email">Email</label>
                        <input type="email" 
                        title="email" 
                        className={styles.Email}
                        id='email'
                        required 
                        disabled = {!showEdit} 
                        defaultValue={userInfo.email} // user info
                        />

                        <label htmlFor="password">Password</label>
                        <input type="password" 
                        title="password" 
                        className={styles.PassWord}
                        id='password'
                        required 
                        disabled = {!showEdit}
                        defaultValue={userInfo.password} // user info
                        />

                    </div>

                    <div className={styles.setting_buttons}>
                        {!showEdit && <button className={styles.edit} onClick={allowEdit}>Edit</button>}
                        {showEdit && 
                        <> 
                            <button className={styles.cancel} 
                            onClick={()=> {allowEdit(), revertBack()}}
                            >Cancel</button>

                            <button className={styles.save}
                            id='saveBtn'
                            onClick={ () => {
                                if(formValid() == true) {allowEdit()}
                                //insert function for updating user info (back end)
                            }}
                            >Save</button> 
                        </>
                        }

                    </div>
                </form>
            </div>
            

            <div className={styles.signOut}>
                <button onClick={logout}>Sign Out</button>
            </div>

            <Navbar />
        </div> 
    );
}

export default Settings;