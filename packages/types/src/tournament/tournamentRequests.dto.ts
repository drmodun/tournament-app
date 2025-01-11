import { tournamentTeamTypeEnumType } from "src/enums";

export interface ICreateTournament {
  name: string;
  description: string;
  country?: string;
  logo?: string;
  startDate: Date;
  endDate: Date;
  isPublic?: boolean;
  links: string[];
  tournamentType?: tournamentTeamTypeEnumType;
  minimumMMR?: number;
  maximumMMR?: number;
  location?: string;
  maxParticipants?: number;
  categoryId: string;
}
