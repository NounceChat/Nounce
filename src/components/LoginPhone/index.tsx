import { FunctionComponent, Suspense } from 'react';
import styles from "./LoginPhone.module.scss";
import LoginImg from "../../assets/img/LogInDesk.svg";
import Box from "../../components/Three/Box";
import AnimatedSphere from "../../components/Three/AnimatedSphere";
import { Canvas } from "@react-three/fiber";

interface LoginPhoneProps { }
 
const LoginPhone: FunctionComponent<LoginPhoneProps> = () => {
    return ( 
    <div className={styles.loginImg}>
      {/* <img src={LoginImg} alt="loginImg" className={styles.loginImg} /> */}
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[-2, 5, 2]} />
        <Suspense fallback={null}>
          <AnimatedSphere></AnimatedSphere>
        </Suspense>
      </Canvas>
    </div>
   );
}
 
export default LoginPhone;