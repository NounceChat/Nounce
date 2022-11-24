import styles from "./Navbar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faGear,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import Logo from "../../assets/img/logo.png";
import { ThemeContext } from "../darkMode/Theme";
const Navbar = () => {
  const { IsDarkMode } = useContext(ThemeContext);

  const UseColor: string = IsDarkMode ? "white" : "black";

  const navigate = useNavigate();

  var iconColors: any = {
    homeColor:
      location.pathname == "/" || location.pathname.includes("/announcement")
        ? UseColor
        : "gray",
    composeColor: location.pathname == "/compose" ? UseColor : "gray",
    settingsColor: location.pathname == "/settings" ? UseColor : "gray",
  };
  return (
    <nav id={styles.navbar}>
      <img src={Logo} alt="Logo" />
      <a
        onClick={() => {
          navigate("/");
        }}
      >
        <FontAwesomeIcon icon={faHouse} color={iconColors.homeColor} />
        <p style={{ color: iconColors.homeColor }}>Home</p>
      </a>
      <a
        onClick={() => {
          navigate("/compose");
        }}
      >
        <FontAwesomeIcon icon={faPenToSquare} color={iconColors.composeColor} />
        <p style={{ color: iconColors.composeColor }}>Compose</p>
      </a>
      <a
        onClick={() => {
          navigate("/settings");
        }}
      >
        <FontAwesomeIcon icon={faGear} color={iconColors.settingsColor} />
        <p style={{ color: iconColors.settingsColor }}>Settings</p>
      </a>
    </nav>
  );
};

export default Navbar;
