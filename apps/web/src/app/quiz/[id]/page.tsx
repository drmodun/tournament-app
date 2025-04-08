import { fetchStage } from "api/client/hooks/stages/serverFetches";
import ManageStage from "views/manageStage";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import { fetchQuiz } from "api/client/hooks/quiz/serverFetches";
import { IQuizResponseExtended } from "@tournament-app/types";
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
