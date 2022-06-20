import { useEffect, useRef, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { makeStyles } from "@mui/styles";

import { formatRelative } from "date-fns";
import { createStyles } from "@mui/styles";

const useStyles = makeStyles(() =>
  createStyles({
    MessageBox: {
      display: "flex",
      height: "50px",
      backgroundColor: "white",
      borderRadius: "7px",
      marginTop: "3px",
    },
    ChatBox: {
      background: "#337979",
      padding: "5px",
      width: "100%",
      borderBottomLeftRadius: "7px",
      borderBottomRightRadius: "7px",
    },
    chatLog: {
      padding: "0",
      height: "200px",
      listStyleType: "none",
      flexDirection: "column",
      display: "flex",
      overflow: "auto",
    },
    UserImg: {
      borderRadius: "50%",
    },
    SubmitButton: {
      width: "100%",
    },
    DisplayName: {
      fontSize: "6px",
    },
    MessageTime: {
      fontSize: "6px",
      color: "gray",
    },
    MessageText: {
      width: "100%",
      marginLeft: "7px",
      backgroundColor: "gray",
      display: "table-cell",
      verticalAlign: "middle",
    },
  })
);

export default function ChatRoom(props: any) {
  const classes = useStyles()

  const db = props.db
  const { uid, displayName, photoURL } = props.user

  const messageEndRef: any | null = useRef(null)

  const [newMessage, setNewMessage] = useState("")

  const handleSubmit = (e: any) => {
    e.preventDefault()

    db.collection("messages").add({
      text: newMessage,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
      photoURL,
    });

    setNewMessage("")
  };

  const [messages, setMessages] = useState([])

  useEffect(() => {
    messageEndRef.current.scrollIntoView({ behavor: "smooth" })
  }, [messages]);

  useEffect(() => {
    db.collection("messages")
      .orderBy("createdAt")
      .limit(100)
      .onSnapshot((querySnapShot: any) => {
        const data = querySnapShot.docs.map((doc: any) => ({
          ...doc.data(),
          id: doc.id,
        }))

        setMessages(data)
      });
  }, [db]);

  return (
    <div className={classes.ChatBox}>
      <ul className={classes.chatLog}>
        {messages.map((message: any) => (
          <li
            key={message.id}
            className={message.uid === uid ? "sent" : "received"}
          >
            <div className={classes.MessageBox}>
              {message.photoURL ? (
                <img
                  className={classes.UserImg}
                  src={message.photoURL}
                  alt="Avatar"
                  width={45}
                  height={45}
                />
              ) : null}

              {message.displayName ? (
                <p className={classes.DisplayName}>{message.displayName}</p>
              ) : null}

              <div className={classes.MessageText}>
                <p>{message.text}</p>
              </div>

              {message.createdAt?.seconds ? (
                <span className={classes.MessageTime}>
                  {formatRelative(
                    new Date(message.createdAt.seconds * 1000),
                    new Date()
                  )}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      <section ref={messageEndRef}></section>
      </ul>

      <form className={classes.SubmitButton} onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />

        <button type="submit" disabled={!newMessage}>
          Send
        </button>
      </form>
    </div>
  );
}
