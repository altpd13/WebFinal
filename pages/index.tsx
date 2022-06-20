import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import ChatRoom from "../components/ChatRoom";
import nookies from "nookies";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createStyles, makeStyles } from "@mui/styles";

const uiConfig = {
  // Redirect to / after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: "/",
  // GitHub as the only included Auth Provider.
  // You could add and configure more here!
  signInOptions: [firebase.auth.GithubAuthProvider.PROVIDER_ID],
};

const useStyles = makeStyles(() =>
  createStyles({
    SignOutNav: {
      "& button": {
        margin:"7px",
        padding: "1%",
        backgroundColor: "red",
        borderRadius: "10px",
        border: "0",
        cursor: "pointer",
      },
    },
    SignInNav: {
      "& button": {
        margin:"7px",
        padding: "1%",
        backgroundColor: "green",
        borderRadius: "10px",
        border: "0",
        cursor: "pointer",
      },
    },
  })
);

const Home = () => {
  const classes = useStyles()

  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_MESUREMENT_ID,
    });
  } else {
    firebase.app()
  }

  const auth = firebase.auth()
  const db = firebase.firestore()
  const [user, setUser] = useState(() => auth.currentUser)

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    });
    auth.onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null)
        nookies.set(undefined, "token", "", { path: "/" });
      } else {
        const token = await user.getIdToken();
        setUser(user)
        nookies.set(undefined, "token", token, { path: "/" });
      }
    });
  }, []);

  useEffect(() => {
    const handle = setInterval(async () => {
      const user = firebase.auth().currentUser
      if (user) await user.getIdToken(true)
    }, 10 * 60 * 1000)

    return () => clearInterval(handle)
  }, [])

  const signInWithGitHub = async () => {
    const provider = new firebase.auth.GithubAuthProvider()
    auth.useDeviceLanguage()

    try {
      await auth.signInWithPopup(provider)
    } catch (error) {
      console.log(error)
    }
  };
  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.useDeviceLanguage()
    try {
      await auth.signInWithPopup(provider)
    } catch (error) {
      console.log(error)
    }
  };
  const signOut = async () => {
    try {
      await firebase.auth().signOut()
    } catch (error) {
      console.log(error.message)
    }
  };

  return (
    <div className="container">
      {user ? (
        <>
          <nav id="sign_out" className={classes.SignOutNav}>
            <h2>Chat With Friends</h2>
            <button onClick={signOut}>Sign Out</button>
          </nav>
          <ChatRoom user={user} db={db} />
        </>
      ) : (
        <>
          <section id="sign_in_Github" className={classes.SignInNav}>
            <h1>Welcome to Chat Room</h1>
            <button onClick={signInWithGitHub}>Sign In With Github</button>
          </section>
          <section id="sign_in_Google" className={classes.SignInNav}>
            <button onClick={signInWithGoogle}>Sign In With Google</button>
          </section>
      
        </>
      )}
    </div>
  );
};

export default Home;
