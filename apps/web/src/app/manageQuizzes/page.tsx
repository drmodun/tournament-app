"use server";

import Navbar from "views/navbar";
import styles from "./index.module.scss";
import CreateQuizForm from "views/createQuizForm";

export default async function Quizes() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <div className={styles.formWrapper}>
          <CreateQuizForm />
        </div>
      </div>
    </div>
  );
}
