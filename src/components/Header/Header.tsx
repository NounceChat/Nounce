import "./Header.module.scss";
import logo from "../../assets/img/logo.png";

const Header = () => {
  let headerName: string =
    location.pathname == "/" || location.pathname == "/announcement"
      ? "Home"
      : location.pathname == "/compose"
      ? "Compose"
      : "Settings";

  //   {
  //     homeColor: (location.pathname == "/" || location.pathname == "/announcement"? 'white' : ''),
  //     composeColor: (location.pathname == "/compose"? 'white' :''),
  //     settingsColor: (location.pathname == "/settings"? 'white' : '')
  // }

  return (
    <header>
      <img src={logo} alt="" />
      <h1>{headerName}</h1>
    </header>
  );
};

export default Header;
