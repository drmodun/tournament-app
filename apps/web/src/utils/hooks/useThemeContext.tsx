import { useContext } from "react";
import { ThemeContext } from "utils/context/themeContext";

export const useThemeContext = () => useContext(ThemeContext);
