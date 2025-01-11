"use client";

import styles from "./manageUser.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Link from "next/link";
import { useRef, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "components/dialog";
import Input from "components/input";
import Chip from "components/chip";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import LaunchIcon from "@mui/icons-material/Launch";

type Team = {
  name: string;
  id: string;
};

type Interest = {
  name: string;
  id: string;
};

export default function ManageUser() {
  const [profilePicture] = useState<string>(
    "https://plus.unsplash.com/premium_photo-1661876708169-5656991eb206?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVuY2luZ3xlbnwwfHwwfHx8MA%3D%3D"
  );
  const [username, setUsername] = useState<string>("test username");
  const [dialogActive, setDialogActive] = useState<boolean>(false);
  const [teams, setTeams] = useState<Team[]>([
    { name: "Team53463456456345634563456345634561", id: "1" },

    { name: "Team243563456345645634653456345634563456", id: "2" },
    { name: "Team3654645435645645633456346534563465", id: "3" },
    { name: "Team43525380803952902358803938920589023235890258903", id: "4" },
    { name: "Team2348902803499234805", id: "5" },
    { name: "Team6378290378249892347", id: "6" },
  ]);

  const [interests, setInterests] = useState<Interest[]>([
    { name: "Interest 1", id: "1" },
    { name: "Interest 2", id: "2" },
    { name: "Interest 3", id: "3" },
    { name: "Interest 4", id: "4" },
    { name: "Interest 5", id: "5" },
    { name: "Interest 6", id: "6" },
  ]);
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const scrollRefTeams = useRef<HTMLDivElement>(null);
  const scrollRefInterests = useRef<HTMLDivElement>(null);
  const scrollRefTeamsEdit = useRef<HTMLDivElement>(null);
  const scrollRefInterestsEdit = useRef<HTMLDivElement>(null);

  const deleteInterest = (id: string) => {
    setInterests(interests.filter((interest) => interest.id !== id));
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id));
  };

  return (
    <div className={styles.wrapper}>
      <Dialog
        active={dialogActive}
        onClose={() => setDialogActive(false)}
        variant={theme}
        className={styles.dialog}
      >
        <div>
          <h3 className={globals[`${textColorTheme}Color`]}>change username</h3>
          <Input
            doesSubmit={true}
            submitLabel="Change"
            label="new username"
            variant={textColorTheme}
            placeholder="enter new username"
            onSubmit={(val: string) => console.log(val)}
            labelVariant={textColorTheme}
          />
        </div>
        <div>
          <h3 className={globals[`${textColorTheme}Color`]}>
            delete interests
          </h3>
          <div
            className={styles.interestsEdit}
            ref={scrollRefInterestsEdit}
            onWheel={(e) => {
              if (scrollRefInterestsEdit?.current) {
                scrollRefInterestsEdit.current.scrollLeft +=
                  e.deltaY > 0 ? 50 : -50;
              }
            }}
          >
            {interests.length == 0 ? (
              <p className={styles.noItemsText}>you have no interests!</p>
            ) : (
              interests.map((interest) => {
                return (
                  <Chip
                    key={interest.id}
                    label={interest.name}
                    variant={textColorTheme}
                    onClick={() => deleteInterest(interest.id)}
                  />
                );
              })
            )}
          </div>
        </div>
        <div>
          <h3 className={globals[`${textColorTheme}Color`]}>delete teams</h3>
          <div
            className={styles.teams}
            ref={scrollRefTeamsEdit}
            onWheel={(e) => {
              if (scrollRefTeamsEdit?.current) {
                scrollRefTeamsEdit.current.scrollLeft +=
                  e.deltaY > 0 ? 50 : -50;
              }
            }}
          >
            {teams.length == 0 ? (
              <p className={styles.noItemsText}>you have no teams!</p>
            ) : (
              teams.map((team) => {
                return (
                  <Chip
                    key={team.id}
                    label={team.name}
                    variant={textColorTheme}
                    onClick={() => deleteTeam(team.id)}
                  />
                );
              })
            )}
          </div>
        </div>
      </Dialog>
      <div className={styles.profileEdit}>
        <button
          title="edit profile button"
          className={styles.editButton}
          onClick={() => setDialogActive(true)}
        >
          <EditIcon
            className={clsx(styles[`${textColorTheme}Fill`], styles.edit)}
          />
        </button>
        <img
          src={profilePicture}
          alt="Profile picture"
          className={clsx(styles.pfp)}
        />
        <div className={clsx(styles.editWrapper)}>
          <div className={styles.usernameEdit}>
            <p
              className={clsx(
                styles.username,
                globals.largeText,
                globals[`${textColorTheme}Color`]
              )}
            >
              {username}
            </p>
          </div>
          <div className={styles.interestsEdit}>
            <b
              className={clsx(
                styles.interest,
                globals[`${textColorTheme}Color`]
              )}
            >
              interests
            </b>
            <div
              className={styles.interests}
              ref={scrollRefInterests}
              onWheel={(e) => {
                if (scrollRefInterests?.current) {
                  scrollRefInterests.current.scrollLeft +=
                    e.deltaY > 0 ? 50 : -50;
                }
              }}
            >
              {interests.map((interest) => {
                return (
                  <Chip
                    key={interest.id}
                    label={interest.name}
                    variant={textColorTheme}
                  />
                );
              })}
            </div>
          </div>
          <div className={styles.teamsEdit}>
            <b className={clsx(styles.team, globals[`${textColorTheme}Color`])}>
              teams
            </b>
            <div
              className={styles.teams}
              ref={scrollRefTeams}
              onWheel={(e) => {
                if (scrollRefTeams?.current) {
                  scrollRefTeams.current.scrollLeft += e.deltaY > 0 ? 50 : -50;
                }
              }}
            >
              {teams.map((team) => {
                return (
                  <Chip
                    key={team.id}
                    label={team.name}
                    variant={textColorTheme}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Link href="/manageTeams">
        <div className={styles.manageTeamsWrapper}>
          <p className={clsx(styles.manageTeamsText)}>manage teams</p>
          <LaunchIcon className={clsx(styles[`${textColorTheme}Fill`])} />
        </div>
      </Link>
    </div>
  );
}
