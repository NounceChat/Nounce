import "./Test.module.scss"
import { useState} from 'react';
import {useNavigate} from "react-router-dom";
import {auth, db} from '../../../public/firebase-config';  
import {collection, addDoc,  query, where, getDocs} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';

function Test() {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [text, setText] =  useState("");    
    const logout  = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            auth.signOut();
            navigate("/login");
        }
    }
    const submitText = async (e:any) => {
        e.preventDefault();
        if (auth.currentUser) 
            console.log(auth.currentUser.phoneNumber);
        
        try{
            const messageRef= collection(db, "phones");
            const q = query(messageRef, where("optedIn", "==", true)); 
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                addDoc(collection(db, "batch_messages"), {
                        to: doc.data().number,
                        body: text,
                        createdAt: new Date()
                    });
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
                user ? <button onClick={logout}>Logout</button>
                : null
            }
        </div> 
    );
}

export default Test;