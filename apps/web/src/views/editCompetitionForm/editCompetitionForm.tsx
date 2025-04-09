"use client";

import {
  IExtendedTournamentResponse,
  IUpdateTournamentRequest,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from "@tournament-app/types";
import { useGetCategories } from "api/client/hooks/categories/useGetCategories";
import { useEditCompetition } from "api/client/hooks/competitions/useEditCompetition";
import { useCreateLocation } from "api/client/hooks/locations/useCreateLocation";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import Input from "components/input";
import ProgressWheel from "components/progressWheel";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { countries } from "country-flag-icons";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { useToastContext } from "utils/hooks/useToastContext";
import {
  COUNTRY_CODES_TO_NAMES,
  COUNTRY_NAMES_TO_CODES,
} from "utils/mixins/formatting";
import styles from "./editCompetitionForm.module.scss";

export default function EditCompetitionForm({
  competition,
  onClose,
}: {
  competition?: IExtendedTournamentResponse;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, isLoading } = useGetCategories();
  const toast = useToastContext();
  const updateCompetitionMutation = useEditCompetition();
  const createLocationMutation = useCreateLocation();

  const methods = useForm<IUpdateTournamentRequest>();
  const onSubmit: SubmitHandler<
    IUpdateTournamentRequest & { id?: number }
  > = async (data) => {
    data.isFakePlayersAllowed = isFakePlayersAllowed;
    data.isPublic = isPublic;
    data.isRanked = isRanked;
    data.isMultipleTeamsPerGroupAllowed = isMultipleTeamsPerGroupAllowed;
    data.categoryId = categoryId;
    data.country = data?.country ?? "Unknown";
    data.locationId = locationId;
    data.id = competition?.id;
    if (links.length > 0) data.links = links.join(",");

    // @ts-ignore
    if (data.minimumMMR == "") data.minimumMMR = "0";
    // @ts-ignore
    if (data.maximumMMR == "") data.maximumMMR = "10000";

    await updateCompetitionMutation.mutateAsync(data);

    onClose && onClose();
  };

  const [isRanked, setIsRanked] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isMultipleTeamsPerGroupAllowed, setIsMultipleTeamsPerGroupAllowed] =
    useState<boolean>(false);
  const [isFakePlayersAllowed, setIsFakePlayersAllowed] =
    useState<boolean>(false);
  const [links, setLinks] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number>(-1);
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const [locationId, setLocationId] = useState<number>();
  const [finalLocationName, setFinalLocationName] = useState<string>();

  const handleAutocomplete = async (
    autocomplete: google.maps.places.Autocomplete,
    placeName?: string
  ) => {
    listener && google.maps.event.removeListener(listener);

    const place = autocomplete.getPlace();

    if (!place.geometry?.location || !placeName || !place.place_id) return;

    const res = await createLocationMutation.mutateAsync({
      lat: place.geometry?.location?.lat(),
      lng: place.geometry?.location?.lng(),
      name: placeName,
      apiId: place.place_id,
    });

    setLocationId(res.id);
    setFinalLocationName(placeName);
  };

  const handleAddLink = (val: string) => {
    const re =
      /[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/i;
    const regex = new RegExp(re);

    if (!val.match(regex)) {
      toast.addToast("invalid link!", "error");
      return;
    }

    if (links.find((link) => link === val)) {
      return;
    }

    setLinks((links) => [...links, val]);
  };

  useEffect(() => {
    setLinks(competition?.links?.split(",") ?? []);
  }, [competition]);

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
            defaultValue={competition?.name}
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
            startingContent={competition?.description}
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
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
            defaultValue={
              competition?.startDate
                ? new Date(competition.startDate)
                    .toISOString()
                    .slice(0, new Date().toISOString().lastIndexOf(":"))
                : new Date()
                    .toISOString()
                    .slice(0, new Date().toISOString().lastIndexOf(":"))
            }
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
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
            defaultValue={
              competition?.endDate
                ? new Date(competition.endDate)
                    .toISOString()
                    .slice(0, new Date().toISOString().lastIndexOf(":"))
                : new Date()
                    .toISOString()
                    .slice(0, new Date().toISOString().lastIndexOf(":"))
            }
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
          {methods.formState.errors.maxParticipants?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={clsx(styles.inputWrapper)}>
          <Input
            variant={textColorTheme}
            label="location"
            placeholder="enter the location of the tournament"
            className={styles.input}
            onChange={(e) => {
              fetchAutocomplete(e.target).then((autocomplete) => {
                const tempListener = autocomplete.addListener(
                  "place_changed",
                  () => {
                    return handleAutocomplete(autocomplete, e.target.value);
                  }
                );
                setListener(tempListener);
              });
            }}
            defaultValue={competition?.actualLocation?.name}
          />
          {methods.formState.errors.location?.type === "required" && (
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
            name="tournamentTeamType"
            isReactFormHook={true}
            label="tournament team type"
            options={[
              tournamentTeamTypeEnum.SOLO,
              tournamentTeamTypeEnum.TEAM,
              tournamentTeamTypeEnum.MIXED,
            ]}
            defaultValue={competition?.teamType}
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
            defaultValue={competition?.location}
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
            defaultValue={competition?.type}
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
            defaultValue={competition?.isPublic ? "yes" : "no"}
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
            defaultValue={competition?.isRanked ? "yes" : "no"}
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
            defaultValue={
              competition?.isMultipleTeamsPerGroupAllowed ? "yes" : "no"
            }
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
            defaultValue={competition?.isFakePlayersAllowed ? "yes" : "no"}
          />
        </div>
        <div className={styles.inputWrapper}>
          <Dropdown
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
            label="country"
            placeholder="select tournament country"
            name="country"
            isReactHookForm={true}
            required={true}
            variant={textColorTheme}
            className={styles.dropdown}
            innerWrapperClassName={styles.dropdown}
            optionsClassName={styles.dropdown}
            style={{ width: "100%" }}
            searchClassName={styles.search}
            defaultValue={competition?.country}
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
              defaultValue={competition?.category?.name}
            />
          )}
          {methods.formState.errors.categoryId?.type === "required" && (
            <p className={styles.error}>dsadsadsa this field is required!</p>
          )}
        </div>

        <Button
          label="edit competition"
          variant="warning"
          submit={true}
          className={styles.submitButton}
        />
      </form>
    </FormProvider>
  );
}
