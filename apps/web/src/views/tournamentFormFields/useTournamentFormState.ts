import { useState } from "react";
import { useLocationPicker } from "utils/hooks/useLocationPicker";
import { useToastContext } from "utils/hooks/useToastContext";

const LINK_PATTERN =
  /[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/i;

// The values the tournament forms send that react-hook-form does not hold itself
type TournamentFormStateFields = {
  isFakePlayersAllowed?: boolean;
  isPublic?: boolean;
  isRanked?: boolean;
  isMultipleTeamsPerGroupAllowed?: boolean;
  categoryId?: number;
  locationId?: number;
  links?: string;
};

// State shared by the create and edit tournament forms: toggles, links, category and location
export function useTournamentFormState() {
  const toast = useToastContext();
  const [isRanked, setIsRanked] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isMultipleTeamsPerGroupAllowed, setIsMultipleTeamsPerGroupAllowed] =
    useState<boolean>(false);
  const [isFakePlayersAllowed, setIsFakePlayersAllowed] =
    useState<boolean>(false);
  const [links, setLinks] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number>(-1);
  const { locationId, selectPlace } = useLocationPicker();

  const addLink = (val: string) => {
    if (!val.match(new RegExp(LINK_PATTERN))) {
      toast.addToast("invalid link!", "error");
      return;
    }

    if (links.find((link) => link === val)) {
      return;
    }

    setLinks((links) => [...links, val]);
  };

  // Copies the shared state onto the payload react-hook-form collected
  const applyTo = <T extends TournamentFormStateFields>(data: T) => {
    data.isFakePlayersAllowed = isFakePlayersAllowed;
    data.isPublic = isPublic;
    data.isRanked = isRanked;
    data.isMultipleTeamsPerGroupAllowed = isMultipleTeamsPerGroupAllowed;
    data.categoryId = categoryId;
    data.locationId = locationId;
    if (links.length > 0) data.links = links.join(",");
  };

  return {
    setIsRanked,
    setIsPublic,
    setIsMultipleTeamsPerGroupAllowed,
    setIsFakePlayersAllowed,
    links,
    setLinks,
    setCategoryId,
    selectPlace,
    addLink,
    applyTo,
  };
}

export type TournamentFormState = ReturnType<typeof useTournamentFormState>;
