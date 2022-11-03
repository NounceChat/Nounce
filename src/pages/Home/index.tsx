import "./Home.module.scss"
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom'; 
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth} from '../../../public/firebase-config';  

function Home() {
    const navigate = useNavigate();    
    const [user] = useAuthState(auth);
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user]);
    return ( 
        <main>

        </main>  
    );
}

export default Home;