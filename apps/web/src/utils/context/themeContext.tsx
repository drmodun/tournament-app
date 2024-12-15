"use client";

import { createContext, ReactNode, useState } from "react";
import { TextVariants } from "types/styleTypes";

export const ThemeContext = createContext<{
  theme: TextVariants;
  setTheme: (val: TextVariants) => void;
}>({
  theme: localStorage.getItem("theme") ?? "dark",
  setTheme: (val: TextVariants) => {
    localStorage.setItem("theme", val);
  },
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const storedTheme: TextVariants | undefined = localStorage.getItem("theme");
  const [theme, _setTheme] = useState<TextVariants>(
    storedTheme != "light" && storedTheme != "dark" ? "light" : storedTheme,
  );

  const setTheme = (val: TextVariants) => {
    localStorage.setItem("theme", val);
    _setTheme(val);
  };
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
