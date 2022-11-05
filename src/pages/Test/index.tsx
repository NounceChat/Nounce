import "./Test.module.scss"
import { useState} from 'react';
import {useNavigate} from "react-router-dom";
import {auth, db} from '../../../public/firebase-config';  
import {collection, addDoc} from 'firebase/firestore';

function Test() {
    const navigate = useNavigate();
    const [text, setText] =  useState("");    
    const logout  = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            auth.signOut();
            navigate("/login");
        }
    }
    const submitText = (e:any) => {
        e.preventDefault();
        if (auth.currentUser) 
            console.log(auth.currentUser.phoneNumber);
        
        try{
            const docRef = addDoc(collection(db, "batch_messages"), {
                to: auth.currentUser?.phoneNumber,
                body: text,
                createdAt: new Date()
            });
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    return ( 
        <div>
            <form onSubmit={submitText}>
                <textarea cols={4} rows={5} onChange={(e)=>{setText(e.target.value)}}></textarea>
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