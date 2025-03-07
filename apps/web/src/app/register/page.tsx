import RegisterForm from "views/registerForm";
import styles from "./index.module.scss";
import Navbar from "views/navbar";

export default async function Register() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <RegisterForm />
      </div>
    </div>
  );
}
