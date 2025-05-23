import { ICategoryMiniResponseWithLogo } from "../category";

export interface IEloRequirementResponse {
  categoryId: number;
  minimumElo: number;
  maximumElo: number;
  category: ICategoryMiniResponseWithLogo;
}

export interface IGroupRequirementsResponse {
  id: number;
  groupId: number;
  minimumAge?: number;
  maximumAge?: number;
  isSameCountry?: boolean;
  eloRequirements?: IEloRequirementResponse[];
}
