// import LoginImg from "../../assets/img/LogInDesk.svg";
import { FunctionComponent, Suspense } from "react";
import styles from "./LoginPhone.module.scss";
import AnimatedSphere from "../../components/Three/AnimatedSphere";
import { OrbitControls } from "@react-three/drei";
import { Model as Iphone } from "../../components/Three/Iphone";
import { Canvas } from "@react-three/fiber";

interface LoginPhoneProps {}

const LoginPhone: FunctionComponent<LoginPhoneProps> = () => {
  return (
    <>
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
      <div className={styles.phoneModel}>
        <Canvas>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={5}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[-2, 5, 2]} />
          <Suspense fallback={null}>
            <Iphone></Iphone>
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};

export default LoginPhone;
