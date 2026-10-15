"use client";

import { ICreateRosterRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateRosters } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const editRoster = async (data: {
  id?: number;
  members?: { userId?: number; isSubstitute?: boolean }[];
}) => {
  console.log(data);
  return clientApi
    .patch<ICreateRosterRequest, AxiosResponse<{ id: number }>>(
      `/roster/${data.id}`,
      { members: data.members },
    )
    .then((res) => res.data);
};

export const useEditRoster = () =>
  useApiMutation({
    mutationFn: editRoster,
    size: "medium",
    pending: "updating the roster...",
    success: "successfully updated roster",
    invalidate: ["roster"],
    afterSuccess: invalidateRosters,
  });
