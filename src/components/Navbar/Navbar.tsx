import styles from"./Navbar.module.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faGear, faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import {useNavigate} from "react-router-dom";
const Navbar = () => {
  
  const navigate = useNavigate();
  
  var iconColors:any = {
      homeColor: (location.pathname == "/"? 'white' : 'gray'),
      composeColor: (location.pathname == "/compose"? 'white' :'gray'),
      settingsColor: (location.pathname == "/settings"? 'white' : 'gray')
  }
  return (

    <nav id={styles.navbar}>
      <a onClick={()=>{navigate("/"); }}>
        <FontAwesomeIcon icon={faHouse} color={iconColors.homeColor}/>
      </a>
      <a onClick={()=>{navigate("/compose")}}>
      <FontAwesomeIcon icon={faPenToSquare} color={iconColors.composeColor}/>
      </a>
      <a onClick={()=>{navigate("/settings")}}>
        <FontAwesomeIcon icon={faGear} color={iconColors.settingsColor}/>
      </a>
    </nav>
  )
}

export default Navbar