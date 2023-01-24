import styles from "./Login.module.scss";
import logo from "../../assets/img/logo.png";
import LoginPhone from "../../components/LoginPhone";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase-config";
import {
  getDocs,
  where,
  collection,
  setDoc,
  query,
  doc,
} from "firebase/firestore";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

function Login() {
  const countryCode = "+639";
  const [phoneNumber, setPhoneNumber] = useState(countryCode);
  const [expandForm, setExpandForm] = useState(false);
  const [OTP, setOTP] = useState("");
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  //replace 09 with +639 at the start regex
  const e164 = (num: string) => {
    if (num.substring(0, 2) == "09") return countryCode + num.substring(2);
    return num;
  };

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  const verifyOTP = (e: any) => {
    e.preventDefault();
    if (OTP.length === 6) {
      window.confirmationResult
        .confirm(OTP)
        .then((result: any) => {
          const myPhone = query(
            collection(db, "phones"),
            where("number", "==", e164(phoneNumber))
          );
          getDocs(myPhone).then((querySnapshot: any) => {
            if (querySnapshot.empty) {
              const validatedNumber = e164(phoneNumber);
              setDoc(doc(db, "phones", validatedNumber), {
                number: validatedNumber,
                isBanned: false,
                isOptedIn: true,
                isDarkMode: true,
                userName: "Anonymous",
                email: "",
                createdAt: new Date(),
                profanityStrike: 5,
              });
            }
          });
          console.log(result.user);
        })
        .catch((error: any) => {
          console.log(error);
          alert("Invalid OTP");
        });
    }
  };

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "auth-container",
      {
        size: "invisible",
        callback: (response: any) => {},
      },
      auth
    );
  };

  const requestOTP = (e: any) => {
    e.preventDefault();
    const convertedNumber = e164(phoneNumber);
    if (
      convertedNumber.length < 13 ||
      convertedNumber.substring(0, 4) !== countryCode
    ) {
      alert("Please enter a valid phone number");
      return;
    }

    generateRecaptcha();
    signInWithPhoneNumber(auth, convertedNumber, window.recaptchaVerifier)
      .then((confirmationResult) => {
        setExpandForm(true);
        window.confirmationResult = confirmationResult;
      })
      .catch((err) => {
        console.error(err);
        console.log(err.message);
      });
  };

  return (
    <section>
      <div className={styles.logoContainer}>
        <img src={logo} alt="logo" />
        <h1>Nounce</h1>
      </div>
      <div className={styles.intro_container}>
        <h1 className={styles.intro_message}>Announce <span>your presence</span></h1>
      </div>
      <p className={styles.description}>
        The Proximity-based chat app.
        <br />
        Connect with users within a mile radius of you.
        <br />
        When you want to. Around you.
      </p>
      
      <LoginPhone/>
      <h1>Announce <span>your presence</span></h1>

      {expandForm === true ? (
        <form className={styles.OTPContainer} onSubmit={verifyOTP}>
          <input
            type="number"
            maxLength={6}
            id="otpInput"
            value={OTP}
            onChange={(e) => setOTP(e.target.value)}
            placeholder="Enter your OTP:"
            min="0"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <button type="submit">
            <p>Verify</p>
          </button>
        </form>
      ) : (
        <form onSubmit={requestOTP}>
          <input
            onChange={(e: any) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            type="tel"
          />
          <button type="submit">
            <p>Sign In</p>
          </button>
        </form>
      )}

      <div id="auth-container"></div>
    </section>
  );
}

export default Login;
