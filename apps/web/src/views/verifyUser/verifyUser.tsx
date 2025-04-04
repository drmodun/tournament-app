"use client";

import { useVerifyUser } from "api/client/hooks/auth/useVerifyUser";
import ProgressWheel from "components/progressWheel";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";

export default function VerifyUser({ token }: { token?: string }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const router = useRouter();

  const { isLoading, isSuccess, isError } = useVerifyUser(token);

  useEffect(() => {
    if (isError) setTimeout(() => router.push("/"), 2000);
    if (isSuccess) setTimeout(() => router.push("/login"), 2000);
  }, [isError, isSuccess]);

  return (
    <div>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : isSuccess ? (
        <p className={globals[`${textColorTheme}Color`]}>
          successfully verified user!
        </p>
      ) : (
        <p className={globals[`${textColorTheme}Color`]}>
          failed to verify user!
        </p>
      )}
    </div>
  );
}
