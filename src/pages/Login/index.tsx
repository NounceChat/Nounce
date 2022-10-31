import "./Login.module.scss"
import logo from "../../assets/img/logo.png"
function Login() {
    return ( 
        <section>
            <img src={logo} alt="logo" />
            <h1>Welcome Back!</h1>
            <button>
                <p>Sign In</p>
            </button>
        </section> 
    );
}

export default Login;