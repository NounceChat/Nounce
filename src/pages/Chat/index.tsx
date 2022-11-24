import styles from "./Chat.module.scss";
import From from "../../components/Bubbles/From";
import To from "../../components/Bubbles/To";
import ChatHeader from "../../components/ChatHeader";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../firebase-config";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar/Navbar";
import { CircularProgress } from "@mui/material";

import * as geofire from "geofire-common";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import ChatDate from "../../components/Bubbles/ChatDate";

export type MyParams = {
  id: string;
};

function Chat() {
  const fieldRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMate, setChatMate] = useState<string>("");
  const [chat, setChat] = useState<any>("");
  const [user] = useAuthState(auth);
  const { id } = useParams<keyof MyParams>() as MyParams;
  const [isBanned, setIsBanned] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const getNearbyPhones = (
    latitude: any,
    longitude: any
  ): Promise<string[]> => {
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
      Promise.all(promises).then((snapshots) => {
        for (const snap of snapshots) {
          for (const doc of snap.docs as Array<any>) {
            const lat = doc.get("lat");
            const lng = doc.get("lng");
            const distanceInKm = geofire.distanceBetween(
              [lat, lng],
              [latitude, longitude]
            );
            const distanceInM = distanceInKm * 1000;
            if (distanceInM <= radiusInM) {
              nearbyPhones.push(doc.id);
            }
          }
        }
        resolve(nearbyPhones);
      });
    });
  };

  const getLocation = async (phone: string) => {
    const location = doc(db, "locations", phone);
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(location, (snapshot) => {
        const data = snapshot.data();
        unsubscribe();
        resolve(data);
      });
    });
  };

  useEffect(() => {
    if (user === null) return;
    const phone = user?.phoneNumber ? user?.phoneNumber : "";
    const q = doc(db, "phones", phone);

    onSnapshot(q, (docSnap) => {
      if (docSnap.exists()) {
        setIsBanned(docSnap.data().isBanned);
      }
    });

    onSnapshot(doc(db, "chats", id), (snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.data().participants.length === 1) {
          setIsWaiting(true);
          return;
        }
        setIsWaiting(false);
        setMessages(snapshot.data().messages);
        const otheruser =
          snapshot.data().participants[0] === user?.phoneNumber
            ? snapshot.data().participants[1]
            : snapshot.data().participants[0];

        getDoc(doc(db, "phones", otheruser))
          .then((doc) => {
            if (doc.exists()) {
              setChatMate(doc?.data()?.userName);
            }
          })
          .catch((error) => {
            setChatMate("Anonymous");
            console.log("Error getting document:", error);
          });

        getLocation(phone)
          .then((location: any) => {
            return { lat: location.lat, lng: location.lng };
          })
          .then((data) => {
            getNearbyPhones(data.lat, data.lng).then((phones) => {
              console.log(phones);
              if (phones.includes(otheruser)) {
                setIsBlocked(false);
              } else {
                setIsBlocked(true);
              }
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }, [user, id]);

  useEffect(() => {
    fieldRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendChat = async (e: any) => {
    e.preventDefault();
    if (user === null || chat.length === 0) return;
    updateDoc(doc(db, "chats", id), {
      messages: arrayUnion({
        id: Math.random().toString(36).substring(7),
        number: user?.phoneNumber,
        body: chat,
        createdAt: new Date(),
      }),
    });
    setChat("");
  };

  const sendOnEnter = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      e.preventDefault;
      sendChat(e);
    }
  };

  return (
    <div id={styles.chat}>
      <ChatHeader chatMate={chatMate} />
      {!isWaiting ? (
        <div id={styles.chatContainer}>
          {messages && messages.length > 0 ? (
            messages.map((message, i, arr) => {
              let prevChat = new Date();
              const previous = arr[i - 1];
              if (previous && previous != undefined) {
                prevChat = new Date(previous?.createdAt.toDate());
              }
              if (message.number === user?.phoneNumber) {
                return (
                  <div key={message.id}>
                    {prevChat.getTime() -
                      message?.createdAt.toDate().getTime() >
                    86400 * 1000 ? (
                      <ChatDate chatDate={message?.createdAt.toDate()} />
                    ) : null}

                    <div className={styles.bubbleContainer}>
                      <From message={message} />
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={message.id}>
                    {Math.abs(
                      prevChat.getTime() - message?.createdAt.toDate().getTime()
                    ) >
                    86400 * 1000 ? (
                      <ChatDate chatDate={message?.createdAt.toDate()} />
                    ) : null}

                    <div className={styles.bubbleContainer}>
                      <To message={message} />
                    </div>
                  </div>
                );
              }
            })
          ) : (
            <p className={styles.no_messages}>No messages</p>
          )}
          <div ref={fieldRef}></div>

          {(() => {
            if (isBanned) {
              return (
                <div className={styles.banned}>
                  <p>You are banned from sending messages</p>
                </div>
              );
            } else if (isBlocked) {
              return (
                <div className={styles.blocked}>
                  <p>Chatmate is no longer in range</p>
                </div>
              );
            } else {
              return (
                <form className={styles.sendContainer} onSubmit={sendChat}>
                  <TextareaAutosize
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    onKeyUp={sendOnEnter}
                    maxRows={4}
                    minRows={1}
                    placeholder="Type a message..."
                    maxLength={160}
                  />
                  <button type="submit">
                    <FontAwesomeIcon
                      icon={faPaperPlane}
                      color="var(--color-group-2)"
                    />
                  </button>
                </form>
              );
            }
          })()}
        </div>
      ) : (
        <div className={styles.loading}>
          <h1>Waiting for chatmate ...</h1>
          <CircularProgress color="secondary" />
        </div>
      )}
      <div className={styles.navContainer}>
        <Navbar />
      </div>
    </div>
  );
}

export default Chat;
