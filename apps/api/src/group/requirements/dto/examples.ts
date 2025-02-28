import {
  CreateGroupRequirementsDto,
  UpdateGroupRequirementsDto,
} from './requests';
import { GroupRequirementsResponseDto } from './responses';

export const createGroupRequirementsExample: CreateGroupRequirementsDto = {
  minimumAge: 18,
  maximumAge: 35,
  isSameCountry: true,
  eloRequirements: [
    {
      categoryId: 1,
      minimumElo: 1000,
      maximumElo: 2000,
    },
    {
      categoryId: 2,
      minimumElo: 1500,
      maximumElo: 2500,
    },
  ],
};

export const updateGroupRequirementsExample: UpdateGroupRequirementsDto = {
  minimumAge: 21,
  maximumAge: 40,
  isSameCountry: false,
  eloRequirements: [
    {
      categoryId: 1,
      minimumElo: 1200,
      maximumElo: 2200,
    },
  ],
};

export const groupRequirementsResponseExample: GroupRequirementsResponseDto = {
  id: 1,
  groupId: 1,
  minimumAge: 18,
  maximumAge: 35,
  isSameCountry: true,
  eloRequirements: [
    {
      categoryId: 1,
      minimumElo: 1000,
      maximumElo: 2000,
      category: {
        id: 1,
        name: 'Category 1',
        logo: 'https://example.com/logo.png',
      },
    },
  ],
};
