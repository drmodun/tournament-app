"use client";

import styles from "./manageTeams.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import Input from "components/input";
import Chip from "components/chip";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CheckboxGroup from "components/checkboxGroup";
import { textColor } from "types/styleTypes";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import RichEditor from "components/richEditor";
import Dropdown from "components/dropdown";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
} from "@tournament-app/types";
import { useGroupJoinRequests } from "api/client/hooks/groups/useGroupJoinRequests";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import ViewLFP from "views/viewLFP";

type Item = {
  name: string;
  id: string;
};

type Category = Item & {
  active: boolean;
};

export default function ManageTeams({
  team,
}: {
  team: IGroupMembershipResponse;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  //const { data, isLoading } = useGroupJoinRequests(team.group.id);

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

  const [requirements, setRequirements] = useState<string[]>([]);

  const [addLfpModalActive, setAddLfpModalActive] = useState<boolean>(false);
  const [viewLfpModalActive, setViewLfpModalActive] = useState<boolean>(false);

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

  const handleLfpSubmission = () => {
    setAddLfpModalActive(false);
  };

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
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <Dialog
        active={addLfpModalActive}
        onClose={() => setAddLfpModalActive(false)}
        variant={theme}
        className={styles.lfpDialogWrapper}
      ></Dialog>
      <Dialog
        active={viewLfpModalActive}
        onClose={() => setViewLfpModalActive(false)}
        variant={theme}
        className={styles.lfpViewDialogWrapper}
      >
        <ViewLFP />
      </Dialog>
      <div className={styles.left}>
        <div>
          <p
            className={clsx(
              styles.teamName,
              globals[`${theme}Color`],
              styles.keepInLine,
            )}
          >
            <img
              src={team.group.logo}
              alt="team logo"
              className={styles.teamImage}
            />
            <div>
              <b className={clsx(globals[`${theme}Color`], globals.largeText)}>
                {`${team?.group?.name} (${team?.group?.abbreviation})`}
              </b>{" "}
              {formatDate(new Date(team.createdAt))}
            </div>
          </p>

          <div className={styles.property}>
            <p>your role</p>
            <b>{team?.role}</b>
          </div>

          <p className={clsx(styles.rostersText, globals[`${theme}Color`])}>
            rosters <GroupsIcon className={styles[`${theme}Fill`]} />
          </p>
          <p>
            teams <GroupIcon className={styles[`${theme}Fill`]} />
          </p>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.lfpTopWrapper}>
          <b className={clsx(globals[`${theme}Color`])}>
            looking for players campains
          </b>
          <button className={styles.lfpButton}>
            <AddIcon className={styles[`${theme}Fill`]} />
          </button>
        </div>
        <div className={styles.campaignsWrapper}>
          <div className={styles.campaignsInnerWrapper}>
            <div className={styles.campaigns}>
              {lfpCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={clsx(
                    styles.campaign,
                    globals[`${theme}BackgroundColor`],
                    globals.paddingHorizontal,
                    globals.doublePaddingVertical,
                  )}
                >
                  <p className={styles.campaignTitle}>{campaign.name}</p>
                  <ArrowOutwardIcon
                    className={styles[`${textColorTheme}Fill`]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
