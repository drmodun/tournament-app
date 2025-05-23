"use client";

import {
  ICreateTournamentRequest,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from "@tournament-app/types";
import { useGetCategoriesInfinite } from "api/client/hooks/categories/useGetCategoriesInfinite";
import { useCreateCompetition } from "api/client/hooks/competitions/useCreateCompetition";
import { useCreateLocation } from "api/client/hooks/locations/useCreateLocation";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import InfiniteDropdown from "components/infiniteDropdown";
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
import styles from "./createTournamentForm.module.scss";

export default function CreateTournamentForm({
  userId,
  onClose,
}: {
  userId: number;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const {
    data,
    isLoading,
    isFetching: categoriesIsFetching,
    fetchNextPage: categoriesFetchNextPage,
  } = useGetCategoriesInfinite();
  const toast = useToastContext();
  const createCompetitionMutation = useCreateCompetition();
  const createLocationMutation = useCreateLocation();

  const methods = useForm<ICreateTournamentRequest>();
  const onSubmit: SubmitHandler<ICreateTournamentRequest> = async (data) => {
    if (data.startDate > data.endDate) {
      toast.addToast(
        "the starting time cannot be greater than then ending time",
        "error"
      );
      return;
    }
    data.isFakePlayersAllowed = isFakePlayersAllowed;
    data.isPublic = isPublic;
    data.isRanked = isRanked;
    data.isMultipleTeamsPerGroupAllowed = isMultipleTeamsPerGroupAllowed;
    data.categoryId = categoryId;
    data.creatorId = userId;
    data.locationId = locationId;
    if (links.length > 0) data.links = links.join(",");

    // @ts-ignore
    if (!data.minimumMMR) data.minimumMMR = 0;
    // @ts-ignore
    if (!data.maximumMMR) data.maximumMMR = 10000;

    await createCompetitionMutation.mutateAsync(data);

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
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
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
              type="number"
            />
            <Input
              variant={textColorTheme}
              placeholder="maximum mmr"
              name="maximumMMR"
              className={clsx(styles.input, styles.mmrInput)}
              isReactFormHook={true}
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
            label="country"
            placeholder="select country"
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
          />

          {methods.formState.errors.country?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.inputWrapper}>
          {isLoading ? (
            <ProgressWheel variant={textColorTheme} />
          ) : (
            <InfiniteDropdown
              isFetching={categoriesIsFetching}
              loadMore={async () => {
                await categoriesFetchNextPage();
              }}
              label="category"
              placeholder="select tournament category"
              name="categoryId"
              isReactHookForm={true}
              required={true}
              variant={textColorTheme}
              options={data?.pages?.flatMap((results) => {
                return (
                  results.results.flatMap((category) => {
                    return { label: category.name, id: category.id };
                  }) ?? []
                );
              })}
              onSelect={(index: number) =>
                setCategoryId(
                  data?.pages?.flatMap((results) => {
                    return (
                      results.results.flatMap((category) => {
                        return { label: category.name, id: category.id };
                      }) ?? []
                    );
                  })[index].id ?? -1
                )
              }
            />
          )}
          {methods.formState.errors.categoryId?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <Button
          label="create competition"
          variant="primary"
          submit={true}
          className={styles.submitButton}
        />
      </form>
    </FormProvider>
  );
}
