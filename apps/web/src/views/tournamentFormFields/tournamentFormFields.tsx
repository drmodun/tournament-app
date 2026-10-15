"use client";

import {
  ICreateTournamentRequest,
  IExtendedTournamentResponse,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Dropdown from "components/dropdown";
import Input from "components/input";
import LocationInput from "components/locationInput";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { countries } from "country-flag-icons";
import { useFormContext } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_CODES_TO_NAMES } from "utils/mixins/formatting";
import { TournamentFormState } from "./useTournamentFormState";

// Value format of <input type="datetime-local">: ISO without seconds
const toDateTimeLocal = (date: Date) => {
  const iso = date.toISOString();
  return iso.slice(0, iso.lastIndexOf(":"));
};

const yesNo = (value?: boolean) => (value ? "yes" : "no");

interface TournamentFormFieldsProps {
  // The owning form's CSS module, so each form keeps its own look
  styles: Record<string, string>;
  state: TournamentFormState;
  // Prefills the fields; only the edit form passes it
  competition?: IExtendedTournamentResponse;
  isEditing?: boolean;
  countryPlaceholder: string;
}

// Every field the create and edit tournament forms share, from name to country.
// Must be rendered inside the form's FormProvider.
export default function TournamentFormFields({
  styles,
  state,
  competition,
  isEditing = false,
  countryPlaceholder,
}: TournamentFormFieldsProps) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const {
    formState: { errors },
  } = useFormContext<ICreateTournamentRequest>();

  const labelClassName = clsx(globals.label, globals[`${textColorTheme}Color`]);
  const requiredError = <p className={styles.error}>this field is required!</p>;
  const now = toDateTimeLocal(new Date());
  const dateDefault = (date?: Date | string) =>
    isEditing ? (date ? toDateTimeLocal(new Date(date)) : now) : undefined;
  const toggleDefault = (value?: boolean) =>
    isEditing ? yesNo(value) : undefined;

  const toggles = [
    {
      name: "isPublic",
      label: "is the tournament public?",
      onChange: state.setIsPublic,
      value: competition?.isPublic,
    },
    {
      name: "isRanked",
      label: "is the tournament ranked?",
      onChange: state.setIsRanked,
      value: competition?.isRanked,
    },
    {
      name: "isMultipleTeamsPerGroupAllowed",
      label: "are multiple teams per group allowed?",
      onChange: state.setIsMultipleTeamsPerGroupAllowed,
      value: competition?.isMultipleTeamsPerGroupAllowed,
    },
    {
      name: "isFakePlayersAllowed",
      label: "are fake players allowed?",
      onChange: state.setIsFakePlayersAllowed,
      value: competition?.isFakePlayersAllowed,
    },
  ];

  const choices = [
    {
      name: "tournamentTeamType",
      label: "tournament team type",
      options: [
        tournamentTeamTypeEnum.SOLO,
        tournamentTeamTypeEnum.TEAM,
        tournamentTeamTypeEnum.MIXED,
      ],
      value: competition?.teamType,
    },
    {
      name: "location",
      label: "tournament location",
      options: [
        tournamentLocationEnum.ONSITE,
        tournamentLocationEnum.ONLINE,
        tournamentLocationEnum.HYBRID,
      ],
      value: competition?.location,
    },
    {
      name: "tournamentType",
      label: "tournament type",
      options: [
        tournamentTypeEnum.COMPETITION,
        tournamentTypeEnum.CONTEST,
        tournamentTypeEnum.EVENT,
        tournamentTypeEnum.LEAGUE,
        tournamentTypeEnum.SEASONAL,
      ],
      value: competition?.type,
    },
  ];

  return (
    <>
      <div className={styles.inputWrapper}>
        <Input
          variant={textColorTheme}
          label="name"
          placeholder="enter the tournament's name"
          name="name"
          required={true}
          className={styles.input}
          isReactFormHook={true}
          defaultValue={competition?.name}
        />
        {errors.name?.type === "required" && requiredError}
      </div>
      <div className={styles.inputWrapper}>
        <p className={labelClassName}>description</p>
        <RichEditor
          isSSR={false}
          isReactHookForm={true}
          name="description"
          variant={textColorTheme}
          required={true}
          startingContent={competition?.description}
        />
        {errors.description?.type === "required" && (
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
          min={now}
          defaultValue={dateDefault(competition?.startDate)}
        />
        {errors.startDate?.type === "required" && requiredError}
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
          min={now}
          defaultValue={dateDefault(competition?.endDate)}
        />
        {errors.endDate?.type === "required" && requiredError}
      </div>
      <div className={styles.inputWrapper}>
        <p className={labelClassName}>mmr</p>
        <div className={styles.mmrInputs}>
          <Input
            variant={textColorTheme}
            placeholder="minimum mmr"
            name="minimumMMR"
            className={clsx(styles.input, styles.mmrInput)}
            isReactFormHook={true}
            defaultValue={competition?.minimumMMR?.toString()}
            type="number"
          />
          <Input
            variant={textColorTheme}
            placeholder="maximum mmr"
            name="maximumMMR"
            className={clsx(styles.input, styles.mmrInput)}
            isReactFormHook={true}
            defaultValue={competition?.maximumMMR?.toString()}
            type="number"
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
          min="1"
          defaultValue={competition?.maxParticipants?.toString()}
        />
        {errors.maxParticipants?.type === "required" && requiredError}
      </div>
      <div className={clsx(styles.inputWrapper)}>
        <LocationInput
          variant={textColorTheme}
          label="location"
          placeholder="enter the location of the tournament"
          className={styles.input}
          defaultValue={competition?.actualLocation?.name}
          onSelect={state.selectPlace}
        />
        {errors.location?.type === "required" && requiredError}
      </div>
      <div className={clsx(styles.inputWrapper, styles.linksWrapper)}>
        <Input
          variant={textColorTheme}
          label="external links"
          placeholder="enter a link"
          doesSubmit={true}
          submitLabel="add"
          onSubmit={(val: string) => state.addLink(val)}
        />
        <ul className={clsx(globals[`${textColorTheme}Color`], styles.links)}>
          {state.links.map((link) => (
            <li key={link}>{link}</li>
          ))}
        </ul>
      </div>
      {choices.map((choice) => (
        <div className={styles.inputWrapper} key={choice.name}>
          <p className={labelClassName}>{choice.label}</p>
          <SlideButton
            variant={textColorTheme}
            name={choice.name}
            isReactFormHook={true}
            label={choice.label}
            options={choice.options}
            defaultValue={choice.value}
          />
        </div>
      ))}
      {toggles.map((toggle) => (
        <div className={styles.inputWrapper} key={toggle.name}>
          <p className={labelClassName}>{toggle.label}</p>
          <SlideButton
            variant={textColorTheme}
            name={toggle.name}
            isReactFormHook={true}
            label={toggle.label}
            options={["no", "yes"]}
            onChange={(val: string) => toggle.onChange(val === "yes")}
            defaultValue={toggleDefault(toggle.value)}
          />
        </div>
      ))}
      <div className={styles.inputWrapper}>
        <Dropdown
          label="country"
          placeholder={countryPlaceholder}
          name="country"
          isReactHookForm={true}
          required={true}
          variant={textColorTheme}
          options={countries.map((country) => {
            return {
              label:
                COUNTRY_CODES_TO_NAMES[
                  country as keyof typeof COUNTRY_CODES_TO_NAMES
                ] ?? "unknown",
            };
          })}
          searchPlaceholder="search..."
          doesSearch={true}
          className={styles.dropdown}
          innerWrapperClassName={styles.dropdown}
          optionsClassName={styles.dropdown}
          style={{ width: "100%" }}
          searchClassName={styles.search}
          defaultValue={competition?.country}
        />
        {errors.country?.type === "required" && requiredError}
      </div>
    </>
  );
}
