import React from "react";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import PromotedEvents from "views/promotedEvents";
import MapSidebar from "views/mapSidebar";
import { IUserResponse } from "@tournament-app/types";

export const user: IUserResponse = {
  id: 1,
  username: "username",
  email: "email",
  bio: "bio",
  level: 1,
  name: "name",
  updatedAt: new Date(),
  followers: 0,
  country: "country",
  profilePicture: "profilePicture",
}; //TODO: remove example

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <div className={styles.promotedEvents}>
          <PromotedEvents />
        </div>
      </div>
      <div className={styles.sidebar}>
        <MapSidebar />
      </div>
    </div>
  );
}
