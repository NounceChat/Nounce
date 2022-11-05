import "./Navbar.module.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faGear, faPenToSquare } from "@fortawesome/free-solid-svg-icons"
const Navbar = () => {
  return (
    <nav>
      <a onClick={()=>{alert('test')}}>
        <FontAwesomeIcon icon={faHouse} />
      </a>
      <a onClick={()=>{alert('test')}}>
      <FontAwesomeIcon icon={faPenToSquare} />
      </a>
      <a onClick={()=>{alert('test')}}>
        <FontAwesomeIcon icon={faGear} />
      </a>
    </nav>
  )
}

export default Navbar