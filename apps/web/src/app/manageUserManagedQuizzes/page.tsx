import ManageQuizzes from "views/manageQuizzes";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import { Suspense } from "react";

export default async function Quizzes() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <Suspense>
          <ManageQuizzes />
        </Suspense>
      </div>
    </div>
  );
}
