import styles from "./Compose.module.scss";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import CircularProgress from "@mui/material/CircularProgress";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import Alert from "@mui/material/Alert";

import * as geofire from "geofire-common";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

function Compose() {
  const maxChar: number = 160;
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [message, setMessage] = useState("");
  const [isBatchMessage, setIsBatchMessage] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (user === null) return;
    const q = query(
      collection(db, "phones"),
      where("number", "==", user?.phoneNumber)
    );
    const phone = user?.phoneNumber ? user?.phoneNumber : "";
    const location = doc(db, "locations", phone);
    onSnapshot(location, (doc) => {
      if (doc.exists()) {
        setLatitude(doc.data().lat);
        setLongitude(doc.data().lng);
      }
    });
    onSnapshot(q, (docSnap) => {
      setIsBanned(docSnap.docs[0].data().isBanned);
    });
  }, [user]);

  const getIsOptedIn = (id: string) => {
    return new Promise((resolve, reject) => {
      const phone = doc(db, "phones", id);
      resolve(
        getDoc(phone).then((doc) => {
          if (doc.exists()) {
            return doc.data().isOptedIn;
          } else {
            return false;
          }
        })
      );
    });
  };

  const getNearbyPhones = (): Promise<string[]> => {
    // query location within a mile radius of user
    return new Promise((resolve, reject) => {
      const nearbyPhones: string[] = [];
      const radiusInM = 1609;
      const bounds = geofire.geohashQueryBounds(
        [latitude, longitude],
        radiusInM
      );
      const promises = [];
      const db = firebase.firestore();
      for (const b of bounds) {
        const q: any = db
          .collection("locations")
          .orderBy("geohash")
          .startAt(b[0])
          .endAt(b[1]);

        promises.push(getDocs(q));
      }
      Promise.all(promises).then(async (snapshots) => {
        for (const snap of snapshots) {
          for (const doc of snap.docs as Array<any>) {
            const lat = doc.get("lat");
            const lng = doc.get("lng");
            const distanceInKm = geofire.distanceBetween(
              [lat, lng],
              [latitude, longitude]
            );
            const distanceInM = distanceInKm * 1000;
            const isOptedIn = await getIsOptedIn(doc.id);
            if (distanceInM <= radiusInM && isOptedIn) {
              nearbyPhones.push(doc.id);
            }
          }
        }
        resolve(nearbyPhones);
      });
    });
  };

  const submitBatch = async () => {
    try {
      if (latitude === 0 || longitude === 0) {
        setIsError(true);
        return;
      }
      setIsLoading(true);
      setIsBatchMessage(true);
      getNearbyPhones()
        .then(async (matchingDocs) => {
          return await addDoc(collection(db, "announcements"), {
            recipients: matchingDocs,
            sender: user?.phoneNumber,
            body: message,
            createdAt: new Date(),
          });
        })
        .then((announcements) => {
          navigate(`/announcement/${announcements?.id}`);
          setMessage("");
          setIsLoading(false);
        });
    } catch (e) {
      setIsLoading(false);
      setIsError(true);
      console.error("Error adding document: ", e);
    }
  };

  const submitSingleChat = async () => {
    if (latitude === 0 || longitude === 0 || user === null) {
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setTimeout( () => {
      setShowMessage(true)
      console.log("5 seconds has elapsed")
    }, 5000)
    setIsBatchMessage(false);
    const rtdb = getDatabase();
    await set(ref(rtdb, "matchmaking/" + user?.phoneNumber), {
      chatId: "placeholder",
      userId: user?.phoneNumber,
      message: message,
    });

    const phoneRef = query(
      collection(db, "phones"),
      where("number", "==", user?.phoneNumber)
    );

    const unsubscribe = onSnapshot(
      phoneRef,
      { includeMetadataChanges: true },
      async (querySnapshot) => {
        querySnapshot.docChanges().forEach(async (change) => {
          if (change.doc.exists()) {
            const chatId = change.doc.data().newChatId;
            if (change.type === "modified" && chatId) {
              setMessage("");
              setIsLoading(false);
              navigate(`/chat/${chatId}`);
              unsubscribe();
            }
          }
        });
      }
    );
  };

  const inputChange = (e: any) => {
    setMessage(e.target.value);
    if (e.target.value.length > maxChar || e.target.value.length === 0) {
      setBtnDisabled(true);
      return;
    }
    setBtnDisabled(false);
  };

  return (
    <div id={styles.compose}>
      <Header />
      {isError ? (
        <Alert
          className={styles.error}
          severity="error"
          onClose={() => {
            setIsError(false);
          }}
        >
          We're having trouble finding someone around you. Please try again.
          Make sure you have location services enabled.
        </Alert>
      ) : null}

      {isLoading ? (
        <div className={styles.loading}>
          {isBatchMessage ? (
            <h1>Sending Announcement ..</h1>
          ) : (
            <h1>Searching for a Chatmate...</h1>
          )}
          <CircularProgress color="secondary" />
          { showMessage &&
            <div id={styles.timerMessage}>
              <h4>Matchmaking is taking a while.</h4>
              <h4 onClick={ ()=> navigate('/')}>Go to Home while it's running in the background?</h4>
            </div>
          }
        </div>
      ) : (
        <>
          {!isBanned ? (
            <div className={styles.container}>
              <div className={styles.title}>
                <h1>Send a Message in your Area</h1>
              </div>

              <div className={styles.mssg_box}>
                <div className={styles.form}>
                  <TextareaAutosize
                    value={message}
                    onChange={inputChange}
                    className={styles.textBox}
                    maxLength={maxChar}
                    minRows={2}
                    maxRows={6}
                    placeholder="Message"
                  />

                  <div className={styles.submit_buttons}>
                    <button
                      disabled={btnDisabled}
                      className={styles.submit_single}
                      onClick={submitSingleChat}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      Single Chat
                    </button>
                    <button
                      disabled={btnDisabled}
                      className={styles.submit_batch}
                      onClick={submitBatch}
                    >
                      <FontAwesomeIcon icon={faUserGroup} />
                      Announce
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.banned}>
              <h3>You have been banned from using this service.</h3>
            </div>
          )}
        </>
      )}
      <Navbar />
    </div>
  );
}

export default Compose;
