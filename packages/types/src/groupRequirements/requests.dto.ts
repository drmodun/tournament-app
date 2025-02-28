export interface IEloRequirement {
  categoryId: number;
  minimumElo: number;
  maximumElo: number;
}

export interface ICreateGroupRequirementsRequest {
  minimumAge?: number;
  maximumAge?: number;
  isSameCountry?: boolean;
  eloRequirements?: IEloRequirement[];
}

export interface IUpdateGroupRequirementsRequest {
  minimumAge?: number;
  maximumAge?: number;
  isSameCountry?: boolean;
  eloRequirements?: IEloRequirement[];
}



