import "./Home.module.scss"
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom'; 
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth} from '../../firebase-config';  

import Header from "../../components/Header/Header";
import Navbar from "../../components//Navbar/Navbar";
import MessageThread from "../../components/MessageThread/MessageThread";

function Home() {
    const navigate = useNavigate();    
    const [user] = useAuthState(auth);
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user]);
    return ( 
        <main>
            <Header />
            <MessageThread/>
            <MessageThread/>
            <MessageThread/>
            <MessageThread/>
            <MessageThread/>
            <MessageThread/>
            <MessageThread/>
            <MessageThread/>
            
            <Navbar />
        </main>  
    );
}

export default Home;