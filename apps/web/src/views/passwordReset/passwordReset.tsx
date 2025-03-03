"use client";

// TODO: Actually implement

import { useResetPassword } from "api/client/hooks/auth/useResetPassword";
import Button from "components/button";
import Input from "components/input";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./passwordReset.module.scss";

export default function PasswordReset({ token }: { token?: string }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [password, setPassword] = useState<string>();
  const [error, setError] = useState<string>();

  const resetPasswordMutation = useResetPassword(token);

  const handleClick = () => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,32}$/;
    if (!password?.match(re)) {
      setError(
        "password must contain at least 1 uppercase letter, 1 special character, 1 number and be at least 8 characters long",
      );
      return;
    }

    resetPasswordMutation.mutate(password);
  };

  return (
    <div>
      <h3 className={globals[`${textColorTheme}Color`]}>reset password</h3>
      <Input
        variant={textColorTheme}
        label="password"
        placeholder="enter new password..."
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className={styles.dangerColor}>{error}</p>}
      <Button label="change" variant="warning" onClick={handleClick} />
    </div>
  );
}
