import firebase from 'firebase/compat/app';
import { getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getFunctions, connectFunctionsEmulator} from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBYTzIuKbZYB14ZBIuYBS9a-o_QaGfrsqU",
  authDomain: "gdg-project-nounce.firebaseapp.com",
  projectId: "gdg-project-nounce",
  storageBucket: "gdg-project-nounce.appspot.com",
  messagingSenderId: "49649051845",
  appId: "1:49649051845:web:6dbb6812118fac0342e8ac",
  measurementId: "G-Z8CD9RJK6Q"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
let functions = getFunctions(app);
// connectFunctionsEmulator(functions, "localhost", 5001);
export {functions};