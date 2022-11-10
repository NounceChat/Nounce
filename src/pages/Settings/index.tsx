import { useState, useEffect } from "react";

import styles from "./Settings.module.scss";
import Header from "../../components/Header/Header";
import Navbar from "../../components//Navbar/Navbar";
import MaterialUISwitch from "../../components/darkMode/darkModeSwitch";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import Switch from "@mui/material/Switch";
import { FormControlLabel } from "@mui/material";

function Settings() {
    const [user] = useAuthState(auth);
    const [showEdit, toggleEdit] = useState(false);
    const [usernameInfo, setUsernameInfo] = useState("");
    const [emailInfo, setEmailInfo] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isOptedIn, setIsOptedIn] = useState(true);
    const [numberInfo, setNumber] = useState("");
    const [userInfo, setUserInfo] = useState<any>(null);
    const [switchDisabled, setSwitchDisabled] = useState(true);

    const navigate = useNavigate();
    const logout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            auth.signOut();
            navigate("/login");
        }
    };

    useEffect(() => {
        //get phone with number of user
        if (user === null)
            return;
        const q = query(
            collection(db, "phones"),
            where("number", "==", user?.phoneNumber)
        );
        getDocs(q).then((querySnapshot) => {
            if (querySnapshot.docs.length <= 0) {
                auth.signOut();
                navigate("/login");
            }
            const phone = querySnapshot.docs[0];
            setUserInfo({ id: phone.id, ...phone.data() });
            setUsernameInfo(phone.data().userName);
            setEmailInfo(phone.data().email);
            setNumber(phone.data().number);
            setIsOptedIn(phone.data().isOptedIn);
            setIsDarkMode(phone.data().isDarkMode);
            setSwitchDisabled(false);
        });
    }, [user]);

    const avatar = `https://avatars.dicebear.com/api/identicon/${user?.phoneNumber}.svg`;

    const allowEdit = () => {
        toggleEdit(!showEdit);
    };

    const revertBack = () => {
        setUsernameInfo(userInfo.userName);
        setEmailInfo(userInfo.email);
        setNumber(userInfo.number);
    };

    const saveChanges = () => {
        const myForm = document.getElementById("myForm") as HTMLFormElement;
        if (!myForm.checkValidity()) return
        updateDoc(doc(db, "phones", userInfo.id), {
            userName: usernameInfo,
            email: emailInfo,
        });
        setUserInfo({
            ...userInfo,
            userName: usernameInfo,
            email: emailInfo,
        });
        allowEdit();
    };

    const validateInput = (input: any) => {
        if (input == null) return "";
        return input;
    };

    const darkModeHandler = () => {
        setSwitchDisabled(true);
        setIsDarkMode(!isDarkMode);
        updateDoc(doc(db, "phones", userInfo.id), {
            isDarkMode: !isDarkMode,
        })
        .then(() => {
            setSwitchDisabled(false);
        })
        .catch((err) => {
            console.log(err);
            setSwitchDisabled(false);
        })
    }

    const optInHandler = () => {
        setSwitchDisabled(true);
        setIsOptedIn(!isOptedIn);
        updateDoc(doc(db, "phones", userInfo.id), {
            isOptedIn: !isOptedIn,
        })
        .then(() => {
            setSwitchDisabled(false);
        })
        .catch((err) => {
            console.log(err);
            setSwitchDisabled(false);
        })
    }

    return (
        <div id={styles.settings}>
            <Header />

            <div className={styles.switch_container}>
                <MaterialUISwitch sx={{ m: 1 }} size="medium" checked={isDarkMode} onChange={darkModeHandler} disabled={switchDisabled} />
                {/* <Switch color='primary'/> */}
                <p>Dark Mode</p>
            </div>

            <div className={styles.setting_avatar}>
                <img src={avatar} alt="" />
            </div>

            <div className={styles.setting_name}>
                <h3>{validateInput(userInfo?.userName)}</h3>
            </div>

            <div className={styles.userInfo}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    id="myForm"
                >
                    <div className={styles.inputFields}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            title="username"
                            className={styles.userName}
                            id="userName"
                            value={validateInput(usernameInfo)}
                            onChange={(e) => {
                                setUsernameInfo(e.target.value);
                            }}
                            required
                            disabled={!showEdit}
                        />

                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            title="email"
                            className={styles.Email}
                            id="email"
                            value={validateInput(emailInfo)}
                            onChange={(e) => {
                                setEmailInfo(e.target.value);
                            }}
                            required
                            disabled={!showEdit}
                        />

                        <label htmlFor="number">Phone Number</label>
                        <input
                            title="number"
                            className={styles.phoneNumber}
                            id="number"
                            value={validateInput(numberInfo)}
                            disabled={true}
                        />
                    </div>


                    <div className={styles.setting_buttons}>
                        {!showEdit && (
                            <button className={styles.edit} onClick={allowEdit}>
                                Edit
                            </button>
                        )}
                        {showEdit && (
                            <>
                                <button
                                    className={styles.cancel}
                                    onClick={() => {
                                        allowEdit(), revertBack();
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    className={styles.save}
                                    id="saveBtn"
                                    onClick={ saveChanges }
                                >
                                    Save
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

            <FormControlLabel className={styles.optIn} label="Opt In to SMS Messages" control={<Switch color='secondary' id='optIn' title="optIn" checked={isOptedIn} onChange={optInHandler} />} />

            <div className={styles.signOut}>
                <button onClick={logout}>Sign Out</button>
            </div>

            <Navbar />
        </div>
    );
}

export default Settings;