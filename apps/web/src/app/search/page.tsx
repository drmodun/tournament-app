import { clsx } from "clsx";
import Navbar from "views/navbar";
import Search from "views/search";
import styles from "styles/pages/pageSearch.module.scss";

export default async function SearchPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <Search />
        </div>
      </div>
    </div>
  );
}
