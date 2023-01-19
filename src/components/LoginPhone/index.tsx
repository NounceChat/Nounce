import { FunctionComponent } from 'react';
import styles from "./LoginPhone.module.scss";
import styled from "styled-components";
import LoginImg from "../../assets/img/LogInDesk.svg";
import Box from "../../components/Three/Box";
import { Canvas } from "@react-three/fiber";

interface LoginPhoneProps { }

const Wrapper = styled.div`
  position: relative;
  background: transparent;

  canvas {
    height: clamp(15rem, 40vw, 100rem);
    width: clamp(15rem, 40vw, 100rem);
  }
`;

 
const LoginPhone: FunctionComponent<LoginPhoneProps> = () => {
    return ( 
    <Wrapper>
      {/* <img src={LoginImg} alt="loginImg" className={styles.loginImg} /> */}
      <Canvas className={styles.loginImg} >
        <Box></Box>
      </Canvas>
    </Wrapper>
   );
}
 
export default LoginPhone;