import { useContext } from "react";
import { DrawerContext } from "utils/context/drawerContext";

export const useDrawerContext = () => useContext(DrawerContext);
