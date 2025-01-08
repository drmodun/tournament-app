"use client";

import styles from "./manageCompetitions.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Dialog from "components/dialog";
import Input from "components/input";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CheckboxGroup from "components/checkboxGroup";
import { textColor, TextVariants } from "types/styleTypes";
import AddIcon from "@mui/icons-material/Add";
import Dropdown from "components/dropdown";
import { CardExpandedProps } from "components/cardExpanded/cardExpanded";
import CardExpanded from "components/cardExpanded";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Button from "components/button";
import SlideButton from "components/slideButton";
import { isEqual, difference } from "lodash";

type CompetitionInputs = {
  name: string;
  category: string;
  type: string;
  teamCompetition: boolean;
  public: boolean;
  eloConstraint: boolean;
  location: "online" | "offline" | "hybrid";
  locationDetails?: string;
  eloRange?: [number, number];
  leagueFormat?: boolean;
};

type EditCompetitionInputs = {
  name?: string;
  category?: string;
  type?: string;
  teamCompetition?: boolean;
  public?: boolean;
  eloConstraint?: boolean;
  location?: "online" | "offline" | "hybrid";
  locationDetails?: string;
  eloRange?: [number, number];
  leagueFormat?: boolean;
};

export default function ManageCompetitions() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const addMethods = useForm<CompetitionInputs>();
  const onAddSubmit: SubmitHandler<CompetitionInputs> = (data) =>
    console.log(data);

  const editMethods = useForm<EditCompetitionInputs>();
  const onEditSubmit: SubmitHandler<EditCompetitionInputs> = (data) =>
    console.log(data);
  const [canSubmitEditForm, setCanSubmitEditForm] = useState<boolean>(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  const [editIndex, setEditIndex] = useState(0);

  const hasChanged = () => {
    const curr = editMethods.getValues();
    const prev = exampleCards[editIndex];
    if (
      curr.category !== prev.category ||
      curr.location !== prev.location ||
      curr.eloConstraint !== (prev.eloConstraint ?? false) ||
      curr.name !== prev?.label ||
      curr.public !== (prev.public ?? false) ||
      curr.leagueFormat !== (prev.leagueFormat ?? false)
    )
      return setCanSubmitEditForm(true);
    return setCanSubmitEditForm(false);
  };

  const exampleCards: CardExpandedProps[] = [
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661876708169-5656991eb206?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVuY2luZ3xlbnwwfHwwfHx8MA%3D%3D",
      label: "HI ",
      participants: 32189321,
      registrationTillDate: Date.now(),
      startDate: Date.now(),
      endDate: Date.now(),
      organizerName: "Queens of the Stone Age",
      tags: ["beginner friendly", "databases", "machine learning/ai"],
      category: "programming",
      variant: theme,
      location: "hybrid",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661876708169-5656991eb206?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVuY2luZ3xlbnwwfHwwfHx8MA%3D%3D",
      label: "HI GUYSSSSS ",
      participants: 2324,
      registrationTillDate: Date.now() + 100000,
      startDate: Date.now() + 100000,
      endDate: Date.now() + 105001,
      organizerName: "Metallica",
      tags: ["expert", "algorithms", "machine learning/ai"],
      category: "programming",
      variant: theme,
      location: "online",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661876708169-5656991eb206?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVuY2luZ3xlbnwwfHwwfHx8MA%3D%3D",
      label: "HI GUYSSSSS ",
      participants: 2324,
      registrationTillDate: Date.now() + 100000,
      startDate: Date.now() + 100000,
      endDate: Date.now() + 105001,
      organizerName: "Metallica",
      tags: ["expert", "algorithms", "machine learning/ai"],
      category: "programming",
      variant: theme,
      location: "offline",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661876708169-5656991eb206?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVuY2luZ3xlbnwwfHwwfHx8MA%3D%3D",
      label: "HI GUYSSSSS ",
      participants: 2324,
      registrationTillDate: Date.now() + 100000,
      startDate: Date.now() + 100000,
      endDate: Date.now() + 105001,
      organizerName: "Metallica",
      tags: ["expert", "algorithms", "machine learning/ai"],
      category: "programming",
      variant: theme,
      location: "hybrid",
    },
  ];

  const [isEloConstrained, setIsEloConstrainted] = useState<boolean>(false);

  const handleEloContraint = () => {
    setIsEloConstrainted((prev) => !prev);
    addMethods.register("eloConstraint");
    addMethods.setValue("eloConstraint", isEloConstrained, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (!isEloConstrained) {
      addMethods.unregister("eloRange");
      return;
    }

    addMethods.register("eloRange", { required: true });
  };

  const handleAddCompetition = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditCompetition = (index: number) => {
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <Dialog
        variant={theme}
        active={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        className={styles.dialog}
      >
        <FormProvider {...addMethods}>
          <form
            onSubmit={addMethods.handleSubmit(onAddSubmit)}
            className={styles.form}
          >
            <div className={styles.dialogOption}>
              <Input
                variant={textColorTheme}
                label="competition name"
                placeholder="enter competition name"
                isReactFormHook={true}
                required={true}
                name="name"
              />
            </div>
            <div className={styles.dialogOption}>
              <Dropdown
                doesSearch={true}
                searchPlaceholder="category name"
                label="select competition category"
                variant={textColorTheme}
                placeholder="select"
                isReactHookForm={true}
                required={true}
                name="category"
                options={[
                  { label: "programming" },
                  { label: "sports" },
                  { label: "other" },
                ]}
              />
            </div>
            <div className={styles.dialogOption}>
              <Dropdown
                doesSearch={true}
                searchPlaceholder="competition type"
                label="select competition type"
                placeholder="select"
                variant={textColorTheme}
                isReactHookForm={true}
                required={true}
                name="type"
                options={[
                  { label: "league" },
                  { label: "competition" },
                  { label: "seasonal" },
                  { label: "contest" },
                  { label: "event" },
                ]}
              />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>location</p>
              <SlideButton options={["offline", "online", "hybrid"]} />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>team competition</p>
              <CheckboxGroup
                checkboxes={[
                  {
                    variant: textColorTheme,
                    onSelect: () => {
                      console.log("hi");
                    },
                  },
                ]}
                isReactHookForm={true}
                name="teamCompetition"
              />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>public</p>
              <CheckboxGroup
                checkboxes={[{ variant: textColorTheme }]}
                isReactHookForm={true}
                name="public"
              />
            </div>

            <div className={styles.dialogOption}>
              <p className={styles.optionName}>league format</p>
              <CheckboxGroup
                checkboxes={[
                  {
                    variant: textColorTheme,
                  },
                ]}
                isReactHookForm={true}
                name="leagueFormat"
              />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>elo contraint</p>
              <CheckboxGroup
                checkboxes={[
                  {
                    variant: textColorTheme,
                    onSelect: handleEloContraint,
                  },
                ]}
                isReactHookForm={true}
                name="eloConstraint"
              />
            </div>
            {isEloConstrained && (
              <div className={styles.dialogFromTo}>
                <Input
                  variant={textColorTheme}
                  placeholder="from"
                  type="number"
                  name="eloRange.0"
                  isReactFormHook={true}
                  required={true}
                />
                <Input
                  variant={textColorTheme}
                  placeholder="to"
                  type="number"
                  name="eloRange.1"
                  isReactFormHook={true}
                  required={true}
                />
              </div>
            )}

            <Button
              variant={
                addMethods.formState.isValid ? "primary" : textColorTheme
              }
              disabled={!addMethods.formState.isValid}
              onClick={() => {
                console.log(addMethods.formState.errors);
              }}
              label="create competition"
            />
          </form>
        </FormProvider>
      </Dialog>
      <Dialog
        variant={theme}
        active={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        className={styles.dialog}
      >
        <FormProvider {...editMethods}>
          <form
            onSubmit={editMethods.handleSubmit(onEditSubmit)}
            onChange={hasChanged}
            className={styles.form}
          >
            <button onClick={hasChanged}>daeoijdaw</button>
            <div className={styles.dialogOption}>
              <Input
                variant={textColorTheme}
                label="competition name"
                placeholder="enter new competition name"
                defaultValue={exampleCards[editIndex].label}
                isReactFormHook={true}
                required={true}
                name="name"
              />
            </div>
            <div className={styles.dialogOption}>
              <Dropdown
                doesSearch={true}
                searchPlaceholder="category name"
                label="select competition category"
                variant={textColorTheme}
                placeholder="select"
                defaultValue={exampleCards[editIndex].category}
                isReactHookForm={true}
                required={true}
                name="category"
                options={[
                  { label: "programming" },
                  { label: "sports" },
                  { label: "other" },
                ]}
              />
            </div>
            <div className={styles.dialogOption}>
              <Dropdown
                doesSearch={true}
                searchPlaceholder="competition type"
                label="select competition type"
                placeholder="select"
                defaultValue={exampleCards[editIndex].category}
                variant={textColorTheme}
                isReactHookForm={true}
                required={true}
                name="type"
                options={[
                  { label: "league" },
                  { label: "competition" },
                  { label: "seasonal" },
                  { label: "contest" },
                  { label: "event" },
                ]}
              />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>location</p>
              <SlideButton
                options={["offline", "online", "hybrid"]}
                defaultValue={exampleCards[editIndex].location}
              />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>team competition</p>
              <CheckboxGroup
                checkboxes={[
                  {
                    variant: textColorTheme,
                    onSelect: () => {
                      console.log("hi");
                    },
                  },
                ]}
                isReactHookForm={true}
                name="teamCompetition"
                defaultValues={[true]}
              />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>public</p>
              <CheckboxGroup
                checkboxes={[{ variant: textColorTheme }]}
                isReactHookForm={true}
                name="public"
              />
            </div>

            <div className={styles.dialogOption}>
              <p className={styles.optionName}>league format</p>
              <CheckboxGroup
                checkboxes={[
                  {
                    variant: textColorTheme,
                  },
                ]}
                isReactHookForm={true}
                name="leagueFormat"
              />
            </div>
            <div className={styles.dialogOption}>
              <p className={styles.optionName}>elo contraint</p>
              <CheckboxGroup
                checkboxes={[
                  {
                    variant: textColorTheme,
                    onSelect: handleEloContraint,
                  },
                ]}
                isReactHookForm={true}
                name="eloConstraint"
              />
            </div>
            {isEloConstrained && (
              <div className={styles.dialogFromTo}>
                <Input
                  variant={textColorTheme}
                  placeholder="from"
                  type="number"
                  name="eloRange.0"
                  isReactFormHook={true}
                  required={true}
                />
                <Input
                  variant={textColorTheme}
                  placeholder="to"
                  type="number"
                  name="eloRange.1"
                  isReactFormHook={true}
                  required={true}
                />
              </div>
            )}

            <Button
              variant={canSubmitEditForm ? "primary" : textColorTheme}
              disabled={!canSubmitEditForm}
              onClick={() => {
                console.log(editMethods.formState.errors);
              }}
              label="create competition"
            />
          </form>
        </FormProvider>
      </Dialog>
      <div className={styles.competitionsTitle}>
        <b className={clsx(globals[`${theme}Color`])}>your competitions</b>
        <button className={styles.addButton} onClick={handleAddCompetition}>
          <AddIcon className={styles[`${theme}Fill`]} />
        </button>
      </div>
      <div className={styles.competitionsWrapper}>
        <div className={styles.competitions}>
          {exampleCards.map((card, index) => (
            <CardExpanded
              key={index}
              {...card}
              onClick={() => handleEditCompetition(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
