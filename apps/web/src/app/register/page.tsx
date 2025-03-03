import Navbar from "views/navbar";
import RegisterForm from "views/registerForm";
import styles from "./index.module.scss";

export default async function User() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <RegisterForm />
      </div>
    </div>
  );
}
