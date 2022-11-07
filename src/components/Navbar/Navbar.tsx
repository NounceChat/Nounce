import styles from"./Navbar.module.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faGear, faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import {useNavigate} from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav id={styles.navbar}>
      <a onClick={()=>{navigate("/")}}>
        <FontAwesomeIcon icon={faHouse} />
      </a>
      <a onClick={()=>{navigate("/compose")}}>
      <FontAwesomeIcon icon={faPenToSquare} />
      </a>
      <a onClick={()=>{navigate("/settings")}}>
        <FontAwesomeIcon icon={faGear} />
      </a>
    </nav>
  )
}

export default Navbar