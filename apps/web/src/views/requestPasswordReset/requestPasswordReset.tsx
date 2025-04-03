"use client";

import { useAuth } from "api/client/hooks/auth/useAuth";
import { useRequestPasswordReset } from "api/client/hooks/auth/useRequestPasswordReset";
import Button from "components/button";
import globals from "styles/globals.module.scss";
import styles from "./requestPasswordReset.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import Input from "components/input";
import { useState } from "react";

export default function RequestPasswordReset() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [email, setEmail] = useState<string>();

  const requestPasswordResetMutation = useRequestPasswordReset();

  return (
    <div>
      <h3 className={globals[`${textColorTheme}Color`]}>
        send reset password request
      </h3>
      <Input
        onChange={(e) => setEmail(e.target.value)}
        label={"email"}
        placeholder="enter email..."
        variant={textColorTheme}
      />
      <Button
        label="send"
        variant="warning"
        onClick={() => requestPasswordResetMutation.mutate(email)}
        className={styles.button}
      />
    </div>
  );
}
