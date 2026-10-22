"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { useApiMutation } from "api/client/useApiMutation";
import { AxiosResponse } from "axios";

// Quizzes live in Vansy. The API asks Vansy for a one-time launch URL and the browser follows it,
// so no Vansy credential ever reaches the browser.

export interface VansyQuiz {
  id: string;
  title: string;
  publishState: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
  participationMode: "SOLO" | "TEAM" | "MIXED";
  questionCount: number;
  maxScore: number;
  startsAt: string | null;
  endsAt: string | null;
}

export type VansyStageQuiz =
  | { linked: false }
  | { linked: true; vansyQuizId: string; quiz: VansyQuiz | null };

export interface VansyStageResults {
  standings: {
    rosterId: number;
    rank: number;
    score: number;
    reviewStatus: string;
  }[];
  attempts: {
    attemptId: string;
    rosterId: number | null;
    score: number;
    maxScore: number;
    status: string;
    reviewStatus: string;
  }[];
}

/** Asks the API for a launch and opens it */
export const openVansy = async (path: string) => {
  const { data } = await clientApi.post<
    never,
    AxiosResponse<{ launchUrl: string }>
  >(path);
  window.location.assign(data.launchUrl);
};

export const useVansyStageQuiz = (stageId?: number) =>
  useQuery({
    queryKey: ["vansy-stage-quiz", stageId],
    queryFn: () =>
      clientApi
        .get<never, AxiosResponse<VansyStageQuiz>>(
          `/vansy/stages/${stageId}/quiz`,
        )
        .then((res) => res.data),
    enabled: !!stageId,
    retry: false,
  });

/** Whether the signed-in user can take the stage quiz (a roster member) and manage it (organiser) */
export const useVansyStageRights = (stageId?: number, signedIn = true) =>
  useQuery({
    queryKey: ["vansy-stage-rights", stageId],
    queryFn: () =>
      clientApi
        .get<never, AxiosResponse<{ canTake: boolean; canManage: boolean }>>(
          `/vansy/stages/${stageId}/me`,
        )
        .then((res) => res.data),
    enabled: !!stageId && signedIn,
    retry: false,
  });

export const useVansyStageResults = (stageId?: number) =>
  useQuery({
    queryKey: ["vansy-stage-results", stageId],
    queryFn: () =>
      clientApi
        .get<never, AxiosResponse<VansyStageResults>>(
          `/vansy/stages/${stageId}/results`,
        )
        .then((res) => res.data),
    enabled: !!stageId,
  });

export const useMyVansyQuizzes = (enabled = true) =>
  useQuery({
    queryKey: ["vansy-my-quizzes"],
    queryFn: () =>
      clientApi
        .get<never, AxiosResponse<VansyQuiz[]>>("/vansy/quizzes/mine")
        .then((res) => res.data),
    enabled,
    retry: false,
  });

export const useLinkVansyQuiz = (stageId?: number) =>
  useApiMutation({
    mutationFn: (quizId: string) =>
      clientApi
        .put(`/vansy/stages/${stageId}/quiz`, { quizId })
        .then((res) => res.data),
    size: "small",
    pending: "linking the quiz...",
    success: "quiz linked to the stage",
    invalidate: ["vansy-stage-quiz"],
  });

export const useFinalizeVansyQuiz = (stageId?: number) =>
  useApiMutation({
    mutationFn: () =>
      clientApi
        .post(`/vansy/stages/${stageId}/finalize`)
        .then((res) => res.data),
    size: "small",
    pending: "closing the quiz...",
    success: "quiz closed; standings arrive once every review is decided",
    invalidate: ["vansy-stage-results"],
  });
