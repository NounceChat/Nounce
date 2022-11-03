import "./Login.module.scss"
import logo from "../../assets/img/logo.png"
import { useState } from 'react';
import {auth} from '../../../public/firebase-config';  
import {RecaptchaVerifier, signInWithPhoneNumber} from 'firebase/auth';

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

  const verifyOTP = (e:any) => {
    let otp = e.target.value;
    setOTP(otp); 
    if(otp.length === 6) {
      window.confirmationResult.confirm(otp).then((result:any) => {
        console.log(result.user);
      }).catch((error:any) => {
        console.log(error);
      })
    } 
  }

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier("auth-container", {
      'size': "invisible",
      'callback': (response:any) => {
      }
    }, auth); 
  }
  
  const requestOTP = (e:any) => {
    e.preventDefault();
    if (phoneNumber.length < 11) {
      alert("Please enter a valid phone number");
      return;
    }
    generateRecaptcha();
    signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then(confirmationResult => {
      setExpandForm(true);
      window.confirmationResult = confirmationResult;  
    })
    .catch(err => {
      console.error(err);
    });
  }

  return ( 
      <section>
          <img src={logo} alt="logo" />
          <h1>Welcome Back!</h1>
          {
            expandForm === true ?
              <div>
                <input type="number" id="otpInput" value={OTP} onChange={verifyOTP} placeholder="Enter your OTP:"/>
                <button type="submit">
                  <p>Verify</p>
                </button>
              </div>
            : 
              <form onSubmit={requestOTP}>
                <input onChange={(e:any) => setPhoneNumber(e.target.value)} type="tel" placeholder="Phone Number"/>
                <button type="submit">
                  <p>Sign In</p>
                </button>
              </form>
          } 

          <div id="auth-container"></div>
      </section> 
  );
}

export default Login;