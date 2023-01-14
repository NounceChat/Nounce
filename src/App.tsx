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
import { doc, runTransaction } from "firebase/firestore";

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
