import {
  IExtendedRosterResponse,
  IMiniGroupResponse,
} from "@tournament-app/types";

export const toBase64 = async (file: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const imageUrlToFile = async (image: string | undefined) => {
  const response = await fetch(image ?? "");
  const blob = await response.blob();
  const file = new File([blob], "image.jpg", { type: blob.type });
  return file;
};

export const extractUniqueGroupsFromRosters = (
  rosters: IExtendedRosterResponse[],
) => {
  const groups: IMiniGroupResponse[] = [];
  const ids: number[] = [];

  for (let roster of rosters) {
    if (roster.participation?.group == null) continue;

    if (!ids.includes(roster.participation?.group.id)) {
      ids.push(roster.participation?.group.id);
      groups.push(roster.participation?.group);
    }
  }

  return groups;
};
