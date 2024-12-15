"use client";

import styles from "./manageTeams.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Link from "next/link";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import Input from "components/input";
import Chip from "components/chip";
import { useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CheckboxGroup from "components/checkboxGroup";
import { CheckboxProps } from "components/checkbox/checkbox";
import { textColor, TextVariants } from "types/styleTypes";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import RichEditor from "components/richEditor";
import Dropdown from "components/dropdown";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type Item = {
  name: string;
  id: string;
};

type Category = Item & {
  active: boolean;
};

type LFPEntry = {
  id: string;
  content: string;
  authorName: string;
  authorID: string;
  country: string | undefined;
  age: number;
  experienceLevel: string;
};

export default function ManageTeams() {
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

  const [teamMembers, setTeamMembers] = useState<Item[]>([
    { name: "team member number 1", id: "1" },
    {
      name: "team member number 2",
      id: "2",
    },
    {
      name: "team member number 3",
      id: "3",
    },
    {
      name: "team member number 4",
      id: "4",
    },
    {
      name: "team member number 5",
      id: "5",
    },
  ]);

  const [rosters, setRosters] = useState<Item[]>([
    { name: "roster number 1", id: "1" },
    {
      name: "roster number 2",
      id: "2",
    },
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

  const teamMembersRef = useRef<HTMLDivElement>(null);
  const rostersRef = useRef<HTMLDivElement>(null);

  const [addLfpModalActive, setAddLfpModalActive] = useState<boolean>(false);
  const [viewLfpModalActive, setViewLfpModalActive] = useState<boolean>(true);

  const [selectedLfpEntryList, setSelectedLfpEntryList] = useState<number>(0);
  const [selectedLfpEntry, setSelectedLfpEntry] = useState<number>(0);

  const addRequirement = (val: string) => {
    setRequirements((prev) => [...prev, val]);
  };

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
      >
        <h3 className={globals[`${textColorTheme}Color`]}>
          add looking for players campaign
        </h3>
        <div className={styles.lfpInputsWrapper}>
          <Input
            label="campaign name"
            variant={textColorTheme}
            placeholder="enter campaign name"
            labelVariant={textColorTheme}
          />
          <div className={styles.editor}>
            <p className={styles.contentLabelLfp}>content</p>
            <RichEditor
              variant={textColorTheme}
              startingContent="write all the needed details for your campaign!"
            />
          </div>
          <div className={styles.requirements}>
            <Input
              label="requirements"
              variant={textColorTheme}
              placeholder="enter every requirement"
              labelVariant={textColorTheme}
              doesSubmit={true}
              submitLabel="add"
              onSubmit={addRequirement}
            />
            <div className={styles.checkboxWrapper}>
              <CheckboxGroup
                checkboxes={requirements.map((x) => {
                  return {
                    label: x,
                    variant: textColorTheme,
                    labelVariant: textColorTheme,
                  };
                })}
              />
            </div>
            <div className={styles.categoryWrapper}>
              <Dropdown
                doesSearch={true}
                searchPlaceholder="search for categories"
                placeholder="select category"
                label="category"
                variant={textColorTheme}
                options={lfpCampaignCategories.map((Category) => {
                  return {
                    label: Category.name,
                    id: Category.id,
                    style: { display: Category.active ? "block" : "none" },
                  };
                })}
              />
            </div>
          </div>
        </div>
        <Button
          variant={"primary"}
          label="post"
          className={styles.submitLfpButton}
          onClick={handleLfpSubmission}
        />
      </Dialog>
      <Dialog
        active={viewLfpModalActive}
        onClose={() => setViewLfpModalActive(false)}
        variant={theme}
        className={styles.lfpViewDialogWrapper}
      >
        <div className={styles.lfpInfo}>
          <b>{lfpCampaigns[selectedLfpEntry].name}</b>
          <div className={styles.lfpUser}>
            <PersonIcon />{" "}
            <p>
              {lfpEntries[selectedLfpEntry][selectedLfpEntryList].authorName} |{" "}
              {getUnicodeFlagIcon(
                lfpEntries[selectedLfpEntry][selectedLfpEntryList].country,
              )}{" "}
              | {lfpEntries[selectedLfpEntry][selectedLfpEntryList].age + "y "}{" "}
              |{" "}
              {
                lfpEntries[selectedLfpEntry][selectedLfpEntryList]
                  .experienceLevel
              }
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
      </Dialog>
      <div className={styles.left}>
        <div>
          <p className={clsx(styles.teamName, globals[`${theme}Color`])}>
            <b className={clsx(globals[`${theme}Color`], globals.largeText)}>
              team name
            </b>{" "}
            28/03/2024
          </p>
          <div className={styles.teamsWrapper}>
            <GroupIcon className={styles[`${theme}Fill`]} />
            <div
              className={styles.teams}
              ref={teamMembersRef}
              onWheel={(e) => {
                if (teamMembersRef?.current) {
                  teamMembersRef.current.scrollLeft += e.deltaY > 0 ? 50 : -50;
                }
              }}
            >
              {teamMembers.map((teamMember) => (
                <Chip
                  key={teamMember.id}
                  label={teamMember.name}
                  variant={theme}
                />
              ))}
            </div>
          </div>
          <p className={clsx(styles.rostersText, globals[`${theme}Color`])}>
            rosters
          </p>
          <div className={styles.rostersWrapper}>
            <GroupsIcon className={styles[`${theme}Fill`]} />
            <div
              className={styles.rosters}
              ref={rostersRef}
              onWheel={(e) => {
                if (rostersRef?.current) {
                  rostersRef.current.scrollLeft += e.deltaY > 0 ? 50 : -50;
                }
              }}
            >
              {rosters.map((roster) => (
                <Chip key={roster.id} label={roster.name} variant={theme} />
              ))}
            </div>
          </div>
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
