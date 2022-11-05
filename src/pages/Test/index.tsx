import "./Test.module.scss"
import {useNavigate} from "react-router-dom";
import {auth} from '../../../public/firebase-config';  
function Test() {
    const navigate = useNavigate();
    const logout  = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            auth.signOut();
            navigate("/login");
        }
    }
    const submitText = (e:any) => {
        e.preventDefault();
    }
    return ( 
        <div>
            <form onSubmit={submitText}>
                <textarea cols={4} rows={5}></textarea>
                <button type="submit">Send</button>
            </form>
            {
                auth.currentUser ? <button onClick={logout}>Logout</button>
                : null
            }
        </div> 
    );
}

export default Test;