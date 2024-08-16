/// The styleTypes file contains the types and constants for the styles in the application.

/// Type that includes the color variants of the app components:
export type Variants =
  | "light"
  | "dark"
  | "primary"
  | "secondary"
  | "danger"
  | "warning";

/// Type that includes the text variants of the textual app components:
export type TextVariants = "light" | "dark";

/// Function that returns the text color based on the variant:
export const textColor = (variant: Variants): string => {
  switch (variant) {
    case "light":
      return "dark";
    default:
      return "light";
  }
};
