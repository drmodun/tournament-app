"use client";

import { useEffect, useState } from "react";
import styles from "./viewRoster.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
  ICreateLFGRequest,
  ICreateLFPRequest,
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
import { useCreateLFP } from "api/client/hooks/lfp/useCreateLFP";
import { clsx } from "clsx";
import MultilineInput from "components/multilineInput";
import { useCreateLFG } from "api/client/hooks/lfg/useCreateLFG";
import { useGetCategories } from "api/client/hooks/categories/useGetCategories";
import { useGetCategoriesFilter } from "api/client/hooks/categories/useGetCategoriesFilter";
import { useGetCategoriesInfinite } from "api/client/hooks/categories/useGetCategoriesInfinite";
import {
  getRostersQuery,
  useGetRostersQuery,
} from "api/client/hooks/rosters/useGetRostersQuery";
import Chip from "components/chip";

export default function ViewRoster({
  stageId,
  groupId,
}: {
  groupId?: number;
  stageId?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
  } = useGetRostersQuery({ stageId, groupId });

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div
      className={clsx(
        globals[`${theme}BackgroundColor`],
        globals[`${textColorTheme}Color`],
        styles.card,
      )}
    >
      {data?.pages[0].results[0].players.map((player) => (
        <div>
          <Chip label={player.user.username} variant={textColorTheme} />
          {player?.career?.map((career) => {
            return (
              <Chip label={career.category.name} variant="secondary">
                {career.elo}
              </Chip>
            );
          })}
          {player.isSubstitute && (
            <p className={globals.warningColor}>substitute player</p>
          )}
        </div>
      ))}
    </div>
  );
}
