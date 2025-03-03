"use client";

import React, { ReactNode, useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { TextVariants } from "types/styleTypes";

export const ThemeContext = React.createContext<{
  theme: TextVariants;
  // eslint-disable-next-line no-unused-vars
  setTheme: (val: TextVariants) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [theme, _setTheme] = useState<TextVariants>("light");

  useEffect(() => {
    setMounted(true);
    const storedTheme = window?.localStorage?.getItem("theme") as TextVariants;
    if (storedTheme === "light" || storedTheme === "dark") {
      _setTheme(storedTheme);
    }
  }, []);

  const setTheme = (val: TextVariants) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", val);
      _setTheme(val);
    }
  };

  if (!mounted) {
    return <div className={globals[`lightBackgroundColor`]}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        className={globals[`${theme}BackgroundColor`]}
        style={{ minHeight: "100vh", height: "100%", width: "100%" }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
