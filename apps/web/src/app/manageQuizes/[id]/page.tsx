"use server";

import Navbar from "views/navbar";
import styles from "./index.module.scss";
import ManageRosters from "views/manageRosters";
import { fetchStage } from "api/client/hooks/stages/serverFetches";
import { AddRosterButton } from "views/manageRosters/manageRosters";
import AddQuestionForm from "views/createQuizQuestionForm/createQuizQuestionForm";
import CreateQuizForm from "views/createQuizForm";

export default async function Quizes({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const res = await fetchStage(id);

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
