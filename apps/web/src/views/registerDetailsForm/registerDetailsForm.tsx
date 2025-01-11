"use client";

import { useState } from "react";
import styles from "./registerDetailsForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Input from "components/input";
import { textColor, TextVariants } from "types/styleTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Button from "components/button";
import { countries } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Dropdown from "components/dropdown";
import SlideButton from "components/slideButton";
import { fetchAutocomplete } from "api/googleMapsAPI/places";

type RegisterInputs = {
  country: string;
  place: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  participatesInOnsiteCompetitions: string;
  preferredOnsiteRadius?: string;
};

export default function RegisterDetailsForm({
  variant = "light",
}: {
  variant?: TextVariants;
}) {
  const methods = useForm<RegisterInputs>();
  const onSubmit: SubmitHandler<RegisterInputs> = (data) => {
    console.log(data, placeId);
  };

  const [
    participatesInOnsiteCompetitions,
    setParticipatesInOnsiteCompetitions,
  ] = useState<string>("no");

  const [preferredRadius, setPreferredRadius] = useState<number | undefined>(0);
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const [placeId, setPlaceId] = useState<string>();

  const handleAutocomplete = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    listener && google.maps.event.removeListener(listener);
    setPlaceId(autocomplete.getPlace().place_id);
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={clsx(globals.titleText, styles.header)}>register</h1>
      <div className={styles.formWrapper}>
        <div>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className={styles.innerFormWrapper}
            >
              <div className={styles.inputWrapper}>
                <div className={clsx(styles.fullName, styles.input)}>
                  <Input
                    labelVariant={variant}
                    variant={variant}
                    label="full name"
                    placeholder="enter your name"
                    name="name"
                    required={true}
                    fullClassName={styles.input}
                    className={styles.input}
                    isReactFormHook={true}
                  />
                  <Input
                    variant={variant}
                    placeholder="enter your surname"
                    name="surname"
                    required={true}
                    fullClassName={styles.input}
                    className={styles.input}
                    isReactFormHook={true}
                  />
                </div>
                <Input
                  variant={variant}
                  placeholder="select your date of birth"
                  name="dateOfBirth"
                  required={true}
                  className={styles.input}
                  isReactFormHook={true}
                  type="date"
                  label="date of birth"
                  min="1900-01-01"
                  max={new Date().toLocaleDateString("fr-ca")}
                />
                <Dropdown
                  options={countries.map((country) => {
                    return {
                      label: `${getUnicodeFlagIcon(country)} ${country}`,
                    };
                  })}
                  searchPlaceholder="search..."
                  doesSearch={true}
                  label="country"
                  placeholder="select your country"
                  name="country"
                  isReactHookForm={true}
                  required={true}
                  variant={variant}
                  innerWrapperClassName={styles.dropdown}
                  optionsClassName={styles.dropdown}
                  searchClassName={styles.dropdown}
                  style={{ width: "100%" }}
                />
                <Input
                  labelVariant={variant}
                  variant={variant}
                  label="place"
                  placeholder="enter your place of residence"
                  name="place"
                  required={true}
                  className={styles.input}
                  isReactFormHook={true}
                  defaultValue=""
                  onChange={(e) => {
                    setPlaceId(undefined);
                    fetchAutocomplete(e.target).then((autocomplete) => {
                      const tempListener = autocomplete.addListener(
                        "place_changed",
                        () => handleAutocomplete(autocomplete)
                      );
                      setListener(tempListener);
                    });
                  }}
                />
                <div className={styles.onsiteSlideButton}>
                  <p className={globals.label}>
                    do you want to participate in on-site competitions?
                  </p>
                  <SlideButton
                    options={["no", "yes"]}
                    onChange={setParticipatesInOnsiteCompetitions}
                  />
                </div>
                {participatesInOnsiteCompetitions === "yes" && (
                  <div className={styles.slider}>
                    <Input
                      labelVariant={variant}
                      variant={variant}
                      label="maximum distance"
                      name="preferredOnsiteRadius"
                      required={true}
                      fullClassName={styles.inputSliderWrapper}
                      className={styles.inputSlider}
                      isReactFormHook={true}
                      type="range"
                      min="0"
                      max="12500"
                      defaultValue="0"
                      onChange={(e) =>
                        setPreferredRadius(e.target.valueAsNumber)
                      }
                      style={{ padding: 0, flexGrow: 1 }}
                    />
                    <p className={styles.preferredRadius}>
                      {preferredRadius}km
                    </p>
                  </div>
                )}
              </div>
              <Button
                label="login"
                variant={
                  methods.formState.isValid && placeId != undefined
                    ? "primary"
                    : textColor(variant)
                }
                disabled={!methods.formState.isValid || placeId == undefined}
                submit={true}
                className={styles.submitButton}
              />
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
