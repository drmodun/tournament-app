"use client";

import { useRouter } from "next/navigation";

export const useRedirect = () => {
  const router = useRouter();

  const redirectToLogin = () => {
    router.push("/login");
  };

  const redirectToHome = () => {
    router.push("/");
  };

  const redirectToMain = () => {
    router.push("/main");
  };

  const redirectToUser = () => {
    router.push("/user");
  };

  const redirectTo = (path: string) => {
    router.push(path);
  };

  return {
    redirectToLogin,
    redirectToHome,
    redirectToMain,
    redirectToUser,
    redirectTo,
  };
};
