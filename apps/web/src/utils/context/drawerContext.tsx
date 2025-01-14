"use client";

import { createContext, ReactNode, useState } from "react";

export const DrawerContext = createContext({
  drawerOpen: false,
  setDrawerOpen: (val: boolean) => {
    val;
  },
});

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  return (
    <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};
