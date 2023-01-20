import firebase from 'firebase/compat/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDHJTHevtL-6Yuetx8gmubAcYXYSuioxs0",
  authDomain: "nounce-chat.firebaseapp.com",
  projectId: "nounce-chat",
  storageBucket: "nounce-chat.appspot.com",
  messagingSenderId: "1073875027140",
  appId: "1:1073875027140:web:10c565a79b1284c28d3591",
  measurementId: "G-V062DQD87Y",
  databaseURL: "https://nounce-chat-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
let functions = getFunctions(app);
// connectFunctionsEmulator(functions, "localhost", 5001);
export { functions };