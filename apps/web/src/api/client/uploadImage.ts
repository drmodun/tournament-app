"use client";

import { clientApi } from "api/client/base";
import { useToastContext } from "utils/hooks/useToastContext";

export type UploadDirectory =
  | "avatar"
  | "group-avatar"
  | "group-banner"
  | "tournament"
  | "tournament-avatar"
  | "quiz";

const isDataUrl = (value: string) => value.startsWith("data:");

// What an image was uploaded as. A form whose request fails afterwards is submitted again with the
// same image, which should not be stored a second time.
const uploaded = new Map<string, string>();
const MAX_REMEMBERED_UPLOADS = 20;

/**
 * Stores an image on the API and returns its URL. Image fields hold a data URL while the person is
 * editing them; anything else (an existing URL, empty) is returned as it is, so only new images are
 * uploaded.
 */
export const uploadImage = async <T extends string | null | undefined>(
  image: T,
  directory: UploadDirectory,
): Promise<T | string> => {
  if (!image || !isDataUrl(image)) return image;

  const key = `${directory}:${image}`;
  const known = uploaded.get(key);

  if (known) return known;

  const blob = await (await fetch(image)).blob();
  const body = new FormData();
  body.append("file", blob, "image");

  const response = await clientApi.post<{ url: string }>(
    `/files/${directory}`,
    body,
    // The browser sets the multipart boundary itself
    { headers: { "Content-Type": undefined } },
  );

  if (uploaded.size >= MAX_REMEMBERED_UPLOADS) {
    uploaded.delete(uploaded.keys().next().value as string);
  }
  uploaded.set(key, response.data.url);

  return response.data.url;
};

/** uploadImage for forms: a failed upload says why, then stops the submit. */
export const useUploadImage = () => {
  const { addToast } = useToastContext();

  return async <T extends string | null | undefined>(
    image: T,
    directory: UploadDirectory,
  ): Promise<T | string> => {
    try {
      return await uploadImage(image, directory);
    } catch (error) {
      const message = (
        error as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;

      addToast(
        `could not upload the image: ${
          (Array.isArray(message) ? message.join(", ") : message) ??
          "try a smaller PNG, JPEG, GIF or WebP"
        }`,
        "error",
      );

      throw error;
    }
  };
};
