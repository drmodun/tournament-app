import {
  BaseTournamentResponseType,
  TournamentResponseEnumType,
} from '@tournament-app/types';

export interface ITournamentWithRelations {
  id: number;
  name: string;
  categoryId: number;
  affiliatedGroupId: number;
  creatorId: number;
  parentTournamentId: number;
}

export type DtoType = ITournamentWithRelations;

export enum TournamentDtosEnum {
  WITH_RELATIONS = 'with-relations',
}

export type TournamentDtosEnumType =
  (typeof TournamentDtosEnum)[keyof typeof TournamentDtosEnum];

export type AnyTournamentReturnType =
  | ITournamentWithRelations
  | BaseTournamentResponseType;

export type TournamentReturnTypesEnumType =
  | TournamentDtosEnumType
  | TournamentResponseEnumType;
