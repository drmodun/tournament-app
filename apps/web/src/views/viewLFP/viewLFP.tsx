"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./viewLFP.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { clsx } from "clsx";
import Button from "components/button";
import { useThemeContext } from "utils/hooks/useThemeContext";
import PersonIcon from "@mui/icons-material/Person";
import RichEditor from "components/richEditor";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
} from "@tournament-app/types";
import { useGroupJoinRequests } from "api/client/hooks/groups/useGroupJoinRequests";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";

type Item = {
  name: string;
  id: string;
};

type Category = Item & {
  active: boolean;
};

export default function ViewLFP() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [lfpCampaigns, setLfpCampaigns] = useState<Item[]>([
    { name: "looking for CS:GO player this is a post!!!", id: "1" },
    {
      name: "this is another post where we look for Fortnite players",
      id: "2",
    },
    {
      name: "this is another post where we look for Fortnite players dosauihdsiauohdiuashdisa",
      id: "3",
    },
    { name: "looking for CS:GO player this is a post!!!", id: "4" },
    {
      name: "this is another post where we look for Fortnite players",
      id: "5",
    },
    {
      name: "this is another post where we look for Fortnite players dosdfhnucksdfnukhsdfhnuisauihdsiauohdiuashdisa",
      id: "6",
    },
    {
      name: "this is another post where we look for Fortnite players dosauihdsiauohdiuashdisa",
      id: "7",
    },
    { name: "looking for CS:GO player this is a post!!!", id: "8" },
  ]);

  const [lfpEntries, setLfpEntries] = useState([
    [
      {
        id: "1",
        content: "<h1> this is a post where we look for Fortnite players</h1>",
        authorName: "Stjepan Lacković",
        age: 23,
        country: "HR",
        authorID: "18149414",
        experienceLevel: "expert",
      },
      {
        id: "1",
        content: "### this is a post where we look for Minecraft players",
        authorName: "Dave Mustaine",
        age: 90,
        country: "RS",
        authorID: "18149431414",
        experienceLevel: "expert",
      },
      {
        id: "3",
        content:
          "### this is a post where we look for League of Legends players",
        authorName: "John Doe",
        age: 25,
        country: "US",
        authorID: "18149415",
        experienceLevel: "intermediate",
      },
      {
        id: "4",
        content: "### this is a post where we look for Valorant players",
        authorName: "Jane Smith",
        age: 28,
        country: "UK",
        authorID: "18149416",
        experienceLevel: "beginner",
      },
      {
        id: "5",
        content: "### this is a post where we look for Dota 2 players",
        authorName: "Alice Johnson",
        age: 30,
        country: "CA",
        authorID: "18149417",
        experienceLevel: "expert",
      },
      {
        id: "6",
        content:
          "### WHEREVER I MAY ROAMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmm (yeah)",
        authorName: "Bob Brown",
        age: 22,
        country: "AU",
        authorID: "18149418",
        experienceLevel: "intermediate",
      },
    ],
    [
      {
        id: "7",
        content: "### this is a post where we look for Fortnite players",
        authorName: "Stjepan Lacković",
        age: 23,
        country: "HR",
        authorID: "18149414",
        experienceLevel: "expert",
      },
      {
        id: "8",
        content: "### this is a post where we look for Minecraft players",
        authorName: "Dave Mustaine",
        age: 90,
        country: "RS",
        authorID: "18149431414",
        experienceLevel: "expert",
      },
      {
        id: "9",
        content:
          "### this is a post where we look for League of Legends players",
        authorName: "John Doe",
        age: 25,
        country: "US",
        authorID: "18149415",
        experienceLevel: "intermediate",
      },
      {
        id: "10",
        content: "### this is a post where we look for Valorant players",
        authorName: "Jane Smith",
        age: 28,
        country: "UK",
        authorID: "18149416",
        experienceLevel: "beginner",
      },
      {
        id: "11",
        content: "### this is a post where we look for Dota 2 players",
        authorName: "Alice Johnson",
        age: 30,
        country: "CA",
        authorID: "18149417",
        experienceLevel: "expert",
      },
      {
        id: "12",
        content:
          "### WHEREVER I MAY ROAMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmmm (yeah)",
        authorName: "Bob Brown",
        age: 22,
        country: "AU",
        authorID: "18149418",
        experienceLevel: "intermediate",
      },
    ],
  ]);

  const [selectedLfpEntryList, setSelectedLfpEntryList] = useState<number>(0);
  const [selectedLfpEntry, setSelectedLfpEntry] = useState<number>(0);

  const [lfpCampaignCategories, setLfpCampaignCategories] = useState<
    Category[]
  >([
    { name: "category 1", id: "1", active: true },
    { name: "category 2", id: "2", active: true },
    { name: "category 3", id: "3", active: true },
    { name: "category 4", id: "4", active: true },
    { name: "category 5", id: "5", active: true },
    { name: "category 6", id: "6", active: true },
  ]);

  const decrementActiveLfpSubmission = () => {
    if (selectedLfpEntryList <= 0)
      setSelectedLfpEntryList(lfpEntries[selectedLfpEntry].length - 1);
    else setSelectedLfpEntryList((curr: number) => curr - 1);
  };

  const incrementActiveLfpSubmission = () => {
    if (selectedLfpEntryList >= lfpEntries[selectedLfpEntry].length - 1)
      setSelectedLfpEntryList(0);
    else setSelectedLfpEntryList((curr: number) => curr + 1);
  };

  return (
    <div>
      <div className={styles.lfpInfo}>
        <b>{lfpCampaigns[selectedLfpEntry].name}</b>
        <div className={styles.lfpUser}>
          <PersonIcon />{" "}
          <p>
            {lfpEntries[selectedLfpEntry][selectedLfpEntryList].authorName} |{" "}
            {getUnicodeFlagIcon(
              lfpEntries[selectedLfpEntry][selectedLfpEntryList].country,
            )}{" "}
            | {lfpEntries[selectedLfpEntry][selectedLfpEntryList].age + "y "} |{" "}
            {lfpEntries[selectedLfpEntry][selectedLfpEntryList].experienceLevel}
          </p>
        </div>

        <div>
          <p className={styles.contentLabelLfp}>entry</p>
          {lfpEntries[selectedLfpEntry][selectedLfpEntryList].content && (
            <RichEditor
              editable={false}
              startingContent={
                lfpEntries[selectedLfpEntry][selectedLfpEntryList].content
              }
            />
          )}
        </div>
      </div>
      <div className={styles.lfpActionButtons}>
        <button
          className={clsx(styles.arrowButton)}
          onClick={decrementActiveLfpSubmission}
        >
          <ArrowBackIcon
            className={clsx(
              styles.lfpActionArrowLeft,
              styles[`${textColorTheme}Fill`],
            )}
          />
        </button>
        <Button
          variant="danger"
          label="decline"
          className={styles.lfpActionButton}
        />
        <Button
          variant="primary"
          label="accept"
          className={styles.lfpActionButton}
        />
        <button
          className={clsx(styles.arrowButton)}
          onClick={incrementActiveLfpSubmission}
        >
          <ArrowForwardIcon
            className={clsx(
              styles.lfpActionArrowRight,
              styles[`${textColorTheme}Fill`],
            )}
          />
        </button>
      </div>
    </div>
  );
}
