import { FunctionComponent } from 'react';
import styles from "./LoginPhone.module.scss";
import LoginImg from "../../assets/img/LogInDesk.svg";

interface LoginPhoneProps {
    
}
 
const LoginPhone: FunctionComponent<LoginPhoneProps> = () => {
    return ( <>
      <img src={LoginImg} alt="loginImg" className={styles.loginImg} />
    </> );
}
 
export default LoginPhone;