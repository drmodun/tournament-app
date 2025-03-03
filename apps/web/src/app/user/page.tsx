"use client";

import { useAuth } from "api/client/hooks/auth/useAuth";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import ManageSettings from "views/manageSettings";
import ManageUser from "views/manageUser";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default function User() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { theme } = useThemeContext();
  const router = useRouter();

  const { data, isLoading, isError } = useAuth();

  const tabs: { component: JSX.Element; name: string }[] = [
    { component: <ManageUser data={data} />, name: "manage user" },
    { component: <ManageSettings />, name: "manage settings" },
  ];

  useEffect(() => {
    if (isError && !isLoading) router.push("/login");
  }, [isLoading]);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} variant={theme} />

      <div>
        <div className={clsx(styles.screen)}>
          <div
            className={clsx(
              styles.tabs,
              globals[`${textColor(theme)}BackgroundColor`],
            )}
          >
            {tabs.map((tab, index) => (
              <Button
                key={index}
                className={clsx(
                  styles.tab,
                  activeTab === index && styles.active,
                  activeTab === index && globals.primaryBackgroundColor,
                )}
                onClick={() => setActiveTab(index)}
                label={tab.name}
                variant={activeTab === index ? "primary" : textColor(theme)}
              />
            ))}
          </div>
          {isLoading ? (
            <ProgressWheel variant={theme} />
          ) : (
            tabs[activeTab].component
          )}
        </div>
      </div>
    </div>
  );
}
