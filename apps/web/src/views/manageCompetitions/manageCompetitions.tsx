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

type CompetitionInputs = {
  name: string;
  category: string;
  type: string;
  teamCompetition: boolean;
  public: boolean;
  eloConstraint: boolean;
  eloRange?: [number, number];
  leagueFormat?: boolean;
};

export default function ManageCompetitions() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const methods = useForm<CompetitionInputs>();
  const onSubmit: SubmitHandler<CompetitionInputs> = (data) =>
    console.log(data);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);

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
    },
  ];

  const [isEloConstrained, setIsEloConstrainted] = useState<boolean>(false);

  const handleEloContraint = () => {
    setIsEloConstrainted((prev) => !prev);
    methods.register("eloConstraint");
    methods.setValue("eloConstraint", isEloConstrained, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (!isEloConstrained) {
      methods.unregister("eloRange");
      return;
    }

    methods.register("eloRange", { required: true });
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
        active={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        className={styles.dialog}
      >
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
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
                  { label: "mathematics" },
                  { label: "physics" },
                  { label: "chemistry" },
                  { label: "biology" },
                  { label: "geography" },
                  { label: "history" },
                  { label: "literature" },
                  { label: "art" },
                  { label: "music" },
                  { label: "sports" },
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
                  { label: "single elimination" },
                  { label: "double elimination" },
                  { label: "triple elimination" },
                  { label: "round-robin" },
                  { label: "biology" },
                  { label: "geography" },
                  { label: "history" },
                  { label: "literature" },
                  { label: "art" },
                  { label: "music" },
                  { label: "sports" },
                ]}
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
                    onSelect: () => setIsEloConstrainted((prev) => !prev),
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

            <button
              onClick={() => {
                console.log("ROXANEE", methods.formState.isValid);
              }}
            >
              hi guys
            </button>
          </form>
        </FormProvider>
      </Dialog>
      <div className={styles.competitionsTitle}>
        <b className={clsx(globals[`${theme}Color`])}>your competitions</b>
        <button className={styles.addButton}>
          <AddIcon className={styles[`${theme}Fill`]} />
        </button>
      </div>
      <div className={styles.competitionsWrapper}>
        <div className={styles.competitions}>
          {exampleCards.map((card, index) => (
            <CardExpanded key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
