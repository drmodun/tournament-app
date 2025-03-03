"use client";

// TODO: Actually implement

import { useAuth } from "api/client/hooks/auth/useAuth";
import { useRequestPasswordReset } from "api/client/hooks/auth/useRequestPasswordReset";
import Button from "components/button";
import globals from "styles/globals.module.scss";
import styles from "./requestPasswordReset.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";

export default function RequestPasswordReset() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const requestPasswordResetMutation = useRequestPasswordReset();

  const { data } = useAuth();

  return (
    <div>
      <h3 className={globals[`${textColorTheme}Color`]}>
        send reset password request
      </h3>

      <Button
        label="send"
        variant="warning"
        onClick={() => requestPasswordResetMutation.mutate(data?.email)}
        className={styles.button}
      />
    </div>
  );
}
