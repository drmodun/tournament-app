"use client";

import React, { useState } from "react";
import styles from "./createTournamentForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Input from "components/input";
import { textColor, TextVariants } from "types/styleTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Button from "components/button";
import { useLogin } from "api/client/hooks/auth/useLogin";
import { useThemeContext } from "utils/hooks/useThemeContext";
import {
  ICreateTournamentRequest,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from "@tournament-app/types";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import Dropdown from "components/dropdown";
import { useGetCategories } from "api/client/hooks/categories/useGetCategories";
import ProgressWheel from "components/progressWheel";
import { countries } from "country-flag-icons";
import {
  COUNTRY_CODES_TO_NAMES,
  COUNTRY_NAMES_TO_CODES,
} from "utils/mixins/formatting";
import { useToastContext } from "utils/hooks/useToastContext";
import {
  createCompetitionFetch,
  useCreateCompetition,
} from "api/client/hooks/competitions/useCreateCompetition";

export default function CreateTournamentForm({ userId }: { userId: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, isLoading } = useGetCategories();
  const toast = useToastContext();
  const createCompetitionMutation = useCreateCompetition();

  const methods = useForm<ICreateTournamentRequest>();
  const onSubmit: SubmitHandler<ICreateTournamentRequest> = async (data) => {
    data.isFakePlayersAllowed = isFakePlayersAllowed;
    data.isPublic = isPublic;
    data.isRanked = isRanked;
    data.isMultipleTeamsPerGroupAllowed = isMultipleTeamsPerGroupAllowed;
    data.categoryId = categoryId;
    data.creatorId = userId;
    data.country = COUNTRY_NAMES_TO_CODES[data.country] ?? "ZZ";
    data.maxParticipants = parseInt(data.maxParticipants ?? "0");
    if (data.minimumMMR) data.minimumMMR = parseInt(data.minimumMMR ?? "0");
    if (data.maximumMMR) data.maximumMMR = parseInt(data.maximumMMR ?? "0");

    createCompetitionFetch(data)
      .then((res) => {
        if (res.status == 400) toast.addToast("invalid values", "error");
        else if (res.status == 200 || res.status == 201)
          toast.addToast("successfully created competition!", "error");
        else if (res.status >= 500)
          toast.addToast("an error occured, please try later", "error");
      })
      .catch((error) => console.log("ERRR", error));
  };

  const [isRanked, setIsRanked] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isMultipleTeamsPerGroupAllowed, setIsMultipleTeamsPerGroupAllowed] =
    useState<boolean>(false);
  const [isFakePlayersAllowed, setIsFakePlayersAllowed] =
    useState<boolean>(false);
  const [links, setLinks] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number>(-1);

  const handleAddLink = (val: string) => {
    const re =
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;
    const regex = new RegExp(re);

    if (!val.match(regex)) {
      toast.addToast("invalid link!", "error");
      return;
    }

    setLinks((links) => [...links, val]);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <div className={styles.inputWrapper}>
          <Input
            variant={textColorTheme}
            label="name"
            placeholder="enter the tournament's name"
            name="name"
            required={true}
            className={styles.input}
            isReactFormHook={true}
          />
          {methods.formState.errors.name?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            description
          </p>
          <RichEditor
            isSSR={false}
            isReactHookForm={true}
            name="description"
            variant={textColorTheme}
            required={true}
          />
          {methods.formState.errors.description?.type === "required" && (
            <p className={clsx(styles.error, styles.errorSpacing)}>
              this field is required!
            </p>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <Input
            variant={textColorTheme}
            label="starting time"
            placeholder="enter the tournament's starting time"
            name="startDate"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
          />
          {methods.formState.errors.startDate?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <Input
            variant={textColorTheme}
            label="ending time"
            placeholder="enter the tournament's ending time"
            name="endDate"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
          />
          {methods.formState.errors.endDate?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            mmr
          </p>
          <div className={styles.mmrInputs}>
            <Input
              variant={textColorTheme}
              placeholder="minimum mmr"
              name="minimumMMR"
              className={clsx(styles.input, styles.mmrInput)}
              isReactFormHook={true}
            />
            <Input
              variant={textColorTheme}
              placeholder="maximum mmr"
              name="maximumMMR"
              className={clsx(styles.input, styles.mmrInput)}
              isReactFormHook={true}
            />
          </div>
        </div>
        <div className={clsx(styles.inputWrapper)}>
          <Input
            variant={textColorTheme}
            label="maximum number of participants"
            placeholder="enter the maximum number of participants"
            name="maxParticipants"
            required={true}
            isReactFormHook={true}
            type="number"
          />
          {methods.formState.errors.maxParticipants?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={clsx(styles.inputWrapper, styles.linksWrapper)}>
          <Input
            variant={textColorTheme}
            label="external links"
            placeholder="enter a link"
            doesSubmit={true}
            submitLabel="add"
            onSubmit={(val: string) => handleAddLink(val)}
          />
          <ul className={clsx(globals[`${textColorTheme}Color`], styles.links)}>
            {links.map((link) => (
              <li>{link}</li>
            ))}
          </ul>
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            tournament team type
          </p>
          <SlideButton
            variant={textColorTheme}
            name="teamType"
            isReactFormHook={true}
            label="tournament team type"
            options={[
              tournamentTeamTypeEnum.SOLO,
              tournamentTeamTypeEnum.TEAM,
              tournamentTeamTypeEnum.MIXED,
            ]}
          />
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            tournament location
          </p>
          <SlideButton
            variant={textColorTheme}
            name="location"
            isReactFormHook={true}
            label="tournament location"
            options={[
              tournamentLocationEnum.ONSITE,
              tournamentLocationEnum.ONLINE,
              tournamentLocationEnum.HYBRID,
            ]}
          />
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            tournament type
          </p>
          <SlideButton
            variant={textColorTheme}
            name="tournamentType"
            isReactFormHook={true}
            label="tournament type"
            options={[
              tournamentTypeEnum.COMPETITION,
              tournamentTypeEnum.CONTEST,
              tournamentTypeEnum.EVENT,
              tournamentTypeEnum.LEAGUE,
              tournamentTypeEnum.SEASONAL,
            ]}
          />
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            is the tournament public?
          </p>
          <SlideButton
            variant={textColorTheme}
            name="isPublic"
            isReactFormHook={true}
            label="is the tournament public?"
            options={["no", "yes"]}
            onChange={(val: string) => {
              setIsPublic(val === "yes");
            }}
          />
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            is the tournament ranked?
          </p>
          <SlideButton
            variant={textColorTheme}
            name="isRanked"
            isReactFormHook={true}
            label="is the tournament ranked?"
            options={["no", "yes"]}
            onChange={(val: string) => {
              setIsRanked(val === "yes");
            }}
          />
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            are multiple teams per group allowed?
          </p>
          <SlideButton
            variant={textColorTheme}
            name="isMultipleTeamsPerGroupAllowed"
            isReactFormHook={true}
            label="are multiple teams per group allowed?"
            options={["no", "yes"]}
            onChange={(val: string) => {
              setIsMultipleTeamsPerGroupAllowed(val === "yes");
            }}
          />
        </div>
        <div className={styles.inputWrapper}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            are fake players allowed?
          </p>
          <SlideButton
            variant={textColorTheme}
            name="isFakePlayersAllowed"
            isReactFormHook={true}
            label="are fake players allowed?"
            options={["no", "yes"]}
            onChange={(val: string) => {
              setIsFakePlayersAllowed(val === "yes");
            }}
          />
        </div>
        <div className={styles.inputWrapper}>
          <Dropdown
            options={countries.map((country) => {
              return {
                label: COUNTRY_CODES_TO_NAMES[country] ?? "unknown",
              };
            })}
            searchPlaceholder="search..."
            doesSearch={true}
            label="country"
            placeholder="select tournament country"
            name="country"
            isReactHookForm={true}
            required={true}
            variant={textColorTheme}
            className={styles.dropdown}
            searchClassName={styles.dropdown}
            innerWrapperClassName={styles.dropdown}
            optionsClassName={styles.dropdown}
          />
          {methods.formState.errors.country?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.inputWrapper}>
          {isLoading ? (
            <ProgressWheel variant={textColorTheme} />
          ) : (
            <Dropdown
              label="category"
              placeholder="select tournament category"
              name="categoryId"
              isReactHookForm={true}
              required={true}
              variant={textColorTheme}
              options={
                data?.results.map((category) => {
                  return { label: category.name };
                }) ?? []
              }
              onSelect={(index: number) =>
                setCategoryId(data?.results[index].id ?? -1)
              }
            />
          )}
          {methods.formState.errors.categoryId?.type === "required" && (
            <p className={styles.error}>dsadsadsa this field is required!</p>
          )}
        </div>

        <Button
          label="create competition"
          variant="primary"
          submit={true}
          className={styles.submitButton}
          onClick={() => console.log(methods.formState.errors)}
        />
      </form>
    </FormProvider>
  );
}
