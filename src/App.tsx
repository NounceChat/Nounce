import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Compose from "./pages/Compose";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import BatchMessages from "./pages/Chat/BatchMessages";
import { Chatcontext } from "./components/MessageThread/Chatcontext";
import "./App.scss";
import ThemeProvider from "./components/darkMode/Theme";
import * as geofire from "geofire-common";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase-config";
import { useState, useEffect } from "react";
import {
  doc,
  runTransaction,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

function App() {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (user === null) return;
    //get current location and store in geofirestore
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const geohash = geofire.geohashForLocation([lat, lng]);
      const number: string = user?.phoneNumber || "";
      runTransaction(db, async (transaction) => {
        const locationRef = doc(db, "locations", number);
        const location = await transaction.get(locationRef);
        if (!location.exists()) {
          transaction.set(locationRef, {
            geohash: geohash,
            lat: lat,
            lng: lng,
            number: user?.phoneNumber,
          });
        } else {
          transaction.update(locationRef, {
            geohash: geohash,
            lat: lat,
            lng: lng,
            number: user?.phoneNumber,
          });
        }
      });
    });
  }, [user]);

  const sortChats = (chats: any[]) => {
    return chats.sort((a, b) => {
      if (a.messages.length == 0 || b.messages.length == 0) 
        return 0;

      const a_timestamp = a.messages[a.messages.length - 1].createdAt;
      const b_timestamp = b.messages[b.messages.length - 1].createdAt;
      return b_timestamp - a_timestamp;
    });
  };

  useEffect(() => {
    if (user === null) return;
    const messageRef = collection(db, "chats");
    const q = query(
      messageRef,
      where("participants", "array-contains", user?.phoneNumber)
    );
    onSnapshot(q, (querySnapshot) => {
      const chats: any[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().messages.length > 0)
          chats.push({ ...doc.data(), id: doc.id, isBatch: false });
      });
      setChats(sortChats(chats));
    });

    const batch_messages_ref = collection(db, "announcements");
    const batch_messages_q = query(
      batch_messages_ref,
      where("sender", "==", user?.phoneNumber)
    );

    onSnapshot(batch_messages_q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const new_chat = {
          id: doc.id,
          messages: [
            {
              id: doc.id,
              body: doc.data().body,
              createdAt: doc.data().createdAt,
              number: doc.data().sender,
            },
          ],
          isBatch: true,
          participants: [user?.phoneNumber, doc.data().sender],
        };
        setChats((chats: any[]) => {
          const new_chats = chats.filter((chat) => chat.id !== new_chat.id);
          new_chats.unshift(new_chat);
          sortChats(new_chats);
          return new_chats;
        });
      });
    });

    const batch_messages_received_q = query(
      batch_messages_ref,
      where("recipients", "array-contains", user?.phoneNumber)
    );

    onSnapshot(batch_messages_received_q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const new_chat = {
          id: doc.id,
          messages: [
            {
              id: doc.id,
              body: doc.data().body,
              createdAt: doc.data().createdAt,
              number: doc.data().sender,
            },
          ],
          isBatch: true,
          participants: [user?.phoneNumber, doc.data().sender],
        };

        setChats((chats:any) => {
          const new_chats = chats.filter((chat:any) => chat.id !== new_chat.id);
          new_chats.unshift(new_chat);
          sortChats(new_chats);
          return new_chats;
        });
      });
    });
  }, [user]);

  return (
    <ThemeProvider>
      <Chatcontext.Provider value={{chats, setChats}}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/login" element={<Login />}></Route>
              <Route path="/compose" element={<Compose />}></Route>
              <Route path="/settings" element={<Settings />}></Route>
              <Route path="/chat/:id" element={<Chat />}></Route>
              <Route path="/announcement/:id" element={<BatchMessages />}></Route>
            </Routes>
          </div>
        </Router>
      </Chatcontext.Provider>
    </ThemeProvider>
  );
}

export default App;