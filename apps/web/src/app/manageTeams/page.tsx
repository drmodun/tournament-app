"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import {
  IGroupMembershipQueryRequest,
  IMiniGroupResponseWithLogo,
} from "@tournament-app/types";
import { useCreateGroup } from "api/client/hooks/groups/useCreateGroup";
import { useSearchUserGroups } from "api/client/hooks/groups/useSearchUserGroups";
import { useUserGroups } from "api/client/hooks/groups/useUserGroups";
import { clsx } from "clsx";
import Button from "components/button";
import Dialog from "components/dialog";
import Input from "components/input";
import ProgressWheel from "components/progressWheel";
import { act, Dispatch, SetStateAction, useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import useDebounce from "utils/hooks/useDebounce";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CreateTeamForm from "views/createTeamForm";
import ManageTeams from "views/manageTeams";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import UserGroupsFilterModal from "views/userGroupsFilterModal";
import { useUserGroupsQuery } from "api/client/hooks/groups/useUserGroupsQuery";

export default function Teams() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(0);

  const [dialogActive, setDialogActive] = useState<boolean>(false);

  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [fetchLimit, setFetchLimit] = useState<number>(-1);
  const [filters, setFilters] = useState<IGroupMembershipQueryRequest>({});

  const {
    data,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchNextPageError,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetchPreviousPageError,
  } = useUserGroupsQuery(filters);
  const createGroupMutation = useCreateGroup();

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchVal, setSearchVal] = useState<string>();
  const debouncedSetSearchVal = useDebounce((value: string) => {
    setSearchVal(value);
  }, 1000);

  const { data: searchData } = useSearchUserGroups(searchVal);

  useEffect(() => {
    createGroupMutation.isSuccess && setDialogActive(false);
  }, [createGroupMutation.isSuccess, data]);

  const forward = async () => {
    if ((data?.pages[activePage]?.results?.length ?? -1) < 2) return;

    const page = await fetchNextPage();

    if (
      isFetchNextPageError ||
      (page.data?.pages[activePage + 1]?.results?.length ?? -1) == 0
    ) {
      setFetchLimit(activePage);
      return;
    }

    setActivePage((curr) => curr + 1);
    setActiveTab(0);
  };

  const backward = async () => {
    if (activePage === 0) return;

    await fetchPreviousPage();

    setActivePage((curr) => curr - 1);
    setActiveTab(0);
  };

  useEffect(() => {
    console.log(
      data?.pages[activePage]?.results?.length,
      activePage,
      activeTab,
    );
  }, [activePage, activeTab]);

  return (
    <div className={styles.wrapper}>
      <Dialog
        active={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        variant={theme}
        className={styles.dialog}
      >
        <UserGroupsFilterModal
          setFilters={setFilters}
          onClose={() => setFilterModalOpen(false)}
        />
      </Dialog>
      <Dialog
        active={dialogActive}
        onClose={() => setDialogActive(false)}
        variant={theme}
        className={styles.dialog}
      >
        <CreateTeamForm
          mutation={createGroupMutation}
          onClose={() => setDialogActive(false)}
        />
      </Dialog>
      <Navbar className={styles.navbar} />
      {isLoading ? (
        <div className={styles.progressWheelWrapper}>
          <ProgressWheel variant={textColorTheme} />
        </div>
      ) : isSearching ? (
        <div className={clsx(styles.screen)}>
          <SearchBar
            data={searchData}
            setSearchVal={debouncedSetSearchVal}
            setDialogActive={setDialogActive}
            setIsSearching={setIsSearching}
          />

          {data?.pages[Math.floor(activePage)]?.results[activeTab] &&
            (searchData?.[activeTab] ||
              data?.pages[Math.floor(activePage)]?.results[activeTab]) && (
              <ManageTeams
                team={
                  searchData?.[activeTab] ||
                  data?.pages[Math.floor(activePage)]?.results[activeTab]
                }
              />
            )}
        </div>
      ) : data?.pages?.[0]?.results?.length === 0 ? (
        <div className={styles.noTeams}>
          <h1 className={globals[`${textColorTheme}Color`]}>no groups found</h1>
          <Button
            label="create team"
            onClick={() => setDialogActive(true)}
            variant="primary"
          />
        </div>
      ) : (
        <div className={clsx(styles.screen)}>
          <div
            className={clsx(
              styles.tabs,
              globals[`${textColor(theme)}BackgroundColor`],
            )}
          >
            <button
              className={clsx(styles.button)}
              title="back"
              onClick={backward}
              disabled={
                isFetchPreviousPageError ||
                isFetchingPreviousPage ||
                isFetching ||
                isLoading ||
                activePage === 0
              }
            >
              <ArrowBackIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
            <div className={styles.teamsWrapper}>
              {[...(data?.pages[activePage]?.results ?? [])].map(
                (tab, index) => {
                  return (
                    <Button
                      key={index}
                      className={clsx(
                        styles.tab,
                        activeTab === index && styles.active,
                      )}
                      onClick={() => setActiveTab(index)}
                      label={tab.group.name}
                      variant={
                        activeTab === index ? "primary" : textColor(theme)
                      }
                    />
                  );
                },
              )}
            </div>
            <button
              className={clsx(styles.button)}
              title="forward"
              onClick={forward}
              disabled={
                isFetchNextPageError ||
                isFetchingNextPage ||
                isFetching ||
                isLoading ||
                fetchLimit === activePage
              }
            >
              <ArrowForwardIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
            <button
              className={clsx(styles.button, styles.addButton)}
              title="create group"
              onClick={() => setDialogActive(true)}
            >
              <AddIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
            <button
              className={clsx(styles.button, styles.addButton)}
              title="filter"
              onClick={() => setFilterModalOpen(true)}
            >
              <FilterAltIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
          </div>

          {data?.pages[Math.floor(activePage)]?.results[activeTab] && (
            <ManageTeams
              team={data.pages[Math.floor(activePage)].results[activeTab]}
            />
          )}
        </div>
      )}
    </div>
  );
}

const SearchBar = ({
  data,
  setSearchVal,
  setDialogActive,
  setIsSearching,
}: {
  data?: IMiniGroupResponseWithLogo[];
  // eslint-disable-next-line no-unused-vars
  setSearchVal?: (val: string) => void;
  // eslint-disable-next-line no-unused-vars
  setDialogActive?: (val: boolean) => void;
  setIsSearching?: Dispatch<SetStateAction<boolean>>;
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  useEffect(() => {
    if ((data?.length ?? 0) <= activeIndex) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [data, activeIndex]);

  return (
    <div
      className={clsx(
        styles.tabs,
        globals[`${textColorTheme}BackgroundColor`],
        styles.searchBar,
      )}
    >
      <div className={styles.searchInputWrapper}>
        <Input
          onChange={(e) => {
            setSearchVal && setSearchVal(e.currentTarget.value);
          }}
          variant={theme}
          placeholder="search..."
          fullClassName={styles.searchInput}
        />
      </div>
      <div className={styles.searchPaginationWrapper}>
        <button
          className={clsx(styles.button)}
          title="back"
          onClick={() => setActiveIndex((prev) => prev - 1)}
          disabled={activeIndex === 0}
        >
          <ArrowBackIcon className={clsx(styles[`${theme}Fill`])} />
        </button>
        <div className={styles.teamsWrapper}>
          <Button
            className={clsx(styles.tab, styles.active)}
            label={data?.[activeIndex]?.name}
            variant={"primary"}
          />
        </div>

        <button
          className={clsx(styles.button)}
          title="forward"
          onClick={() => setActiveIndex((prev) => prev + 1)}
          disabled={!data || data.length <= activeIndex - 1}
        >
          <ArrowForwardIcon className={clsx(styles[`${theme}Fill`])} />
        </button>
        <button
          className={clsx(styles.button, styles.addButton)}
          title="create team"
          onClick={() => setDialogActive && setDialogActive(true)}
        >
          <AddIcon className={clsx(styles[`${theme}Fill`])} />
        </button>
        <button
          className={clsx(styles.button, styles.addButton)}
          title="toggle search"
          onClick={() =>
            setIsSearching && setIsSearching((prev: boolean) => !prev)
          }
        >
          <SearchIcon className={clsx(styles[`${theme}Fill`])} />
        </button>
      </div>
    </div>
  );
};
