import React, { useState, useLayoutEffect, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";

export const ThemeContext = React.createContext({
  IsDarkMode: true,
  toggleDarkMode: () => {},
});

export default function ThemeProvider({ children }: any) {
  // keeps state of the current theme
  //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [IsDarkMode, setIsDarkMode] = useState(true);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user === null) return;
    const number: string = user?.phoneNumber ? user?.phoneNumber : "";
    const phoneRef = doc(db, "phones", number);
    getDoc(phoneRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setIsDarkMode(snapshot.data().isDarkMode);
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, [user]);

  // paints the app before it renders elements
  useLayoutEffect(() => {
    // Media Hook to check what theme user prefers
    applyTheme();
    // if state changes, repaints the app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IsDarkMode]);

  // rewrites set of css variablels/colors
  const applyTheme = () => {
    let theme;
    if (IsDarkMode) {
      theme = darkTheme;
    }
    if (!IsDarkMode) {
      theme = lightTheme;
    }

    const root = document.getElementsByTagName("html")[0];
    theme ? (root.style.cssText = theme.join(";")) : null;
  };

  const toggleDarkMode = () => {
    console.log("Toggle Method Called");

    // A smooth transition on theme switch
    const body = document.getElementsByTagName("body")[0];
    body.style.cssText = "transition: background .5s ease";

    setIsDarkMode(!IsDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        IsDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// styles
const lightTheme = [
  "--color-group-1: var(--light-group-1)",
  "--color-group-2: var(--light-group-2)",
  "--color-group-3: var(--light-group-3)",
  "--color-group-4: var(--light-group-4)",
  "--text-color: var(--light-text-color)",
  "--bg-color: var(--light-bg-color)",
  "--nav-color: var(--light-nav)",
  "--isBlocked-color: var(--light-isBlocked)",
];

const darkTheme = [
  "--color-group-1: var(--dark-group-1)",
  "--color-group-2: var(--dark-group-2)",
  "--color-group-3: var(--dark-group-3)",
  "--color-group-4: var(--dark-group-4)",
  "--text-color: var(--dark-text-color)",
  "--bg-color: var(--dark-bg-color)",
  "--nav-color: var(--dark-nav)",
  "--isBlocked-color: var(--dark-isBlocked)",
];
