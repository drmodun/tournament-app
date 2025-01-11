import styles from "./aboutWinning.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";

export default function AboutWinning() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftContent}>
        <h1 className={clsx(globals.titleText, styles.header)}>
          what is winning.sh?
        </h1>
        <p className={clsx(styles.text)}>
          winning.sh is the ultimate solution for hosting, promoting, and
          joining competitions 🏆. Whether it's a sports tournament 🏀, e-sports
          challenge 👨🏻‍💻, pub quiz 📝, or any other competitive event. say goodbye
          👋 to juggling multiple sites for event organization, promotion 📈,
          and participation.
        </p>
      </div>
      <div className={styles.imageWrapper}>
        <img
          className={clsx(styles.image)}
          src="https://images.unsplash.com/photo-1552127966-d24b805b9be7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="People winning a sports competition."
        />
      </div>
    </div>
  );
}
