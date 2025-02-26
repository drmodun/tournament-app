"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./addLFPForm.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
  tournamentLocationEnum,
} from "@tournament-app/types";
import { UseMutationResult } from "@tanstack/react-query";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { FormProvider, useForm } from "react-hook-form";
import Input from "components/input";
import RichEditor from "components/richEditor";
import CheckboxGroup from "components/checkboxGroup";
import Dropdown from "components/dropdown";
import Button from "components/button";

type Item = {
  name: string;
  id: string;
};

type Category = Item & {
  active: boolean;
};

export default function AddLFPForm() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const methods = useForm();
  const onSubmit = (data: any) => console.log(data);

  const [requirements, setRequirements] = useState<string[]>([]);
  const [addLfpModalActive, setAddLfpModalActive] = useState<boolean>(false);
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

  const addRequirement = (val: string) => {
    setRequirements((prev) => [...prev, val]);
  };

  const handleLfpSubmission = () => {
    setAddLfpModalActive(false);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
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
      </form>
    </FormProvider>
  );
}
