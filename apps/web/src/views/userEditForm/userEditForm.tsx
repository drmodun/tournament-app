"use client";

import styles from "./userEditForm.module.scss";
import globals from "styles/globals.module.scss";
import { useEffect, useRef, useState } from "react";
import Input from "components/input";
import Chip from "components/chip";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import {
  IExtendedUserResponse,
  IGroupMembershipResponseWithDates,
  IUpdateUserInfo,
} from "@tournament-app/types";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import RichEditor from "components/richEditor";
import {
  leaveUserGroups,
  useLeaveUserGroups,
} from "api/client/hooks/groups/useLeaveUserGroups";
import { useUpdateUser } from "api/client/hooks/user/useUpdateUser";
import Button from "components/button";

type UserEditFormProps = {
  data: IExtendedUserResponse | undefined;
  groupData: any;
};

type UpdateUserForm = {
  profilePicture?: string;
  country?: string;
  username?: string;
  name?: string;
  bio?: string;
  location?: string;
};

export default function userEditForm({ data, groupData }: UserEditFormProps) {
  const updateUser = useUpdateUser();
  const leaveUserGroups = useLeaveUserGroups();

  const [teams, setTeams] = useState<IGroupMembershipResponseWithDates[]>([]);
  const [teamIdDeletions, setTeamIdDeletions] = useState<number[]>([]);
  const [placeId, setPlaceId] = useState<string>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const [file, setFile] = useState<File>();

  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const scrollRefTeamsEdit = useRef<HTMLDivElement>(null);

  const methods = useForm<UpdateUserForm>();
  const onSubmit: SubmitHandler<UpdateUserForm> = async (_data) => {
    if (!data) return;
    console.log("DATA:", _data);
    updateUser.mutate({ ..._data, id: data?.id });
    leaveUserGroups.mutate(teamIdDeletions);
  };

  const deleteTeam = (id: number) => {
    setTeams(teams.filter((team) => team.id !== id));
    setTeamIdDeletions((prev) => [...prev, id]);
  };

  const handleAutocomplete = (
    autocomplete: google.maps.places.Autocomplete,
  ) => {
    listener && google.maps.event.removeListener(listener);
    setPlaceId(autocomplete.getPlace().place_id);
  };

  const checkValidity = () => {
    if (!methods.formState.isValid) {
      setIsFormValid(false);
      return;
    }

    if (
      file ||
      data?.username !== methods.getValues("username") ||
      (data?.location !== methods.getValues("location") && placeId) ||
      data?.bio !== methods.getValues("bio") ||
      teamIdDeletions.length > 0
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  useEffect(() => {
    setTeams(groupData?.results);
  }, [groupData]);

  useEffect(() => {
    checkValidity();
  }, [methods.getValues()]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.form}
        onChange={checkValidity}
      >
        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>
            change profile picture
          </h3>
          <div className={styles.pfpEdit}>
            {file ? (
              <ImagePicker
                file={file}
                name="profilePicture"
                isReactFormHook={true}
                variant={textColorTheme}
                className={styles.imagePicker}
              />
            ) : (
              <ImageDrop
                onFile={setFile}
                variant={textColorTheme}
                className={styles.imageDrop}
              />
            )}
          </div>
        </div>
        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>change username</h3>
          <Input
            label="new username"
            variant={textColorTheme}
            placeholder="enter new username"
            labelVariant={textColorTheme}
            defaultValue={data?.username}
            isReactFormHook={true}
            name="username"
          />
        </div>
        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>change location</h3>
          <Input
            variant={textColorTheme}
            label="location"
            placeholder="enter your place of residence"
            name="location"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            defaultValue={data?.location}
            onChange={(e) => {
              setPlaceId(undefined);
              fetchAutocomplete(e.target).then((autocomplete) => {
                const tempListener = autocomplete.addListener(
                  "place_changed",
                  () => handleAutocomplete(autocomplete),
                );
                setListener(tempListener);
              });
            }}
          />
        </div>
        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>change bio</h3>
          <RichEditor
            name="bio"
            isReactHookForm={true}
            editable={true}
            startingContent={data?.bio}
            variant={textColorTheme}
          />
        </div>

        <div className={styles.formItem}>
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
              teams.map((team: IGroupMembershipResponseWithDates) => {
                return (
                  <div className={styles.team} key={team.id}>
                    <Chip
                      key={-team.id}
                      label={team.name}
                      variant={textColorTheme}
                      className={styles.team}
                      onClick={(e) => {
                        e.preventDefault();
                        deleteTeam(team.id);
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className={styles.formItem}>
          <Button
            variant={isFormValid ? "primary" : textColorTheme}
            disabled={!isFormValid}
            submit={true}
            label="update"
            className={styles.updateButton}
          />
        </div>
      </form>
    </FormProvider>
  );
}
