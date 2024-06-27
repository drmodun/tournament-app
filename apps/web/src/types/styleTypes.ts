/// The styleTypes file contains the types and constants for the styles in the application.

/// Type that includes the color variants of the app components:
export type Variants =
  | "light"
  | "dark"
  | "primary"
  | "secondary"
  | "danger"
  | "warning";

/// Constants for the colors used in the color pallette of the app:
export const PRIMARY = "#59C3C3";
export const SECONDARY = "#197BBD";
export const LIGHT = "#F2F2F2";
export const DARK = "#21262C";
export const DANGER = "#F45B69";
export const WARNING = "#F2AF29";

export const PRIMARY_MUTED = "#71ADAD";
export const SECONDARY_MUTED = "#2E77A8";
export const LIGHT_MUTED = "#DEDEDE";
export const DARK_MUTED = "#383838";
export const DANGER_MUTED = "#E26E78";
export const WARNING_MUTED = "#DBA73D";

/// Helper class that returns the color of the variant.
export class Variant {
  variant: Variants;

  constructor(variant: Variants) {
    this.variant = variant;
  }

  getVariant(): string {
    return this.variant;
  }

  /// Returns the color of the variant.
  color(): string {
    switch (this.variant) {
      case "light":
        return LIGHT;
      case "dark":
        return DARK;
      case "primary":
        return PRIMARY;
      case "secondary":
        return SECONDARY;
      case "danger":
        return DANGER;
      case "warning":
        return WARNING;
      default:
        return PRIMARY;
    }
  }

  /// Returns the color that should be used for the text above the element with the provided color variant.
  textColor(): string {
    switch (this.variant) {
      case "light":
        return DARK;
      default:
        return LIGHT;
    }
  }

  mutedColor(): string {
    switch (this.variant) {
      case "light":
        return LIGHT_MUTED;
      case "dark":
        return DARK_MUTED;
      case "primary":
        return PRIMARY_MUTED;
      case "secondary":
        return SECONDARY_MUTED;
      case "danger":
        return DANGER_MUTED;
      case "warning":
        return WARNING_MUTED;
      default:
        return PRIMARY_MUTED;
    }
  }
}
