import "./Test.module.scss"
import { useState} from 'react';
import {useNavigate} from "react-router-dom";
import {auth, db} from '../../firebase-config';  
import {collection, addDoc,  query, where, getDocs, updateDoc, limit} from 'firebase/firestore';
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
            const q = query(messageRef, where("optedIn", "==", true), limit(3)); 
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

    const findChat = () => {
        const phoneRef = collection(db, "phones");
        const myNumber = query(phoneRef, where("number", "==", user?.phoneNumber));
        getDocs(myNumber).then((querySnapshot) => {
            updateDoc(querySnapshot.docs[0].ref, {
                isSearching: true
            });
        });
        const q = query(phoneRef, where("isSearching", "==", true), where("number", "!=", user?.phoneNumber), limit(1));
        getDocs(q).then((querySnapshot) => {
            if (querySnapshot.docs.length > 0) {
                addDoc(collection(db, "chats"), {
                    createdAt: new Date(),
                    messages: [{
                        createdAt: new Date(),
                        body: "Hello",
                        number: user?.phoneNumber,
                    }],
                    particiants: [user?.phoneNumber, querySnapshot.docs[0].data().number],
                });
            }
        }) 
        .catch((error) => {
            console.log("Error getting documents: ", error);
        }); 
    }

    const send = () => {
        const phoneRef = collection(db, "phones");
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