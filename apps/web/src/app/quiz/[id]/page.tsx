import Navbar from "views/navbar";
import styles from "styles/pages/pageTabs.module.scss";
import ManageQuiz from "views/manageQuiz";

export default async function Quiz({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageQuiz id={id} />
      </div>
    </div>
  );
}
