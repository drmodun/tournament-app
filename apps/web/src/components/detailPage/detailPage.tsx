"use client";

import { clsx } from "clsx";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { ReactNode } from "react";
import styles from "./detailPage.module.scss";

/**
 * Two-column layout shared by the competition and group pages: a banner and
 * markdown description on the left, a sidebar and actions on the right.
 */
export default function DetailPage({
  logo,
  title,
  subtitle,
  description,
  sidebar,
  actions,
  dialogs,
  spacedSidebar = false,
}: {
  logo?: string;
  title: ReactNode;
  subtitle?: string;
  description?: string;
  /** Sidebar rows, usually `SidebarSection`s. */
  sidebar: ReactNode;
  /** Rendered under the sidebar rows (join/leave/manage buttons). */
  actions?: ReactNode;
  /** Dialogs rendered before the page content. */
  dialogs?: ReactNode;
  /** Adds a gap between the sidebar rows and the actions. */
  spacedSidebar?: boolean;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  return (
    <div className={clsx(styles.wrapper)}>
      {dialogs}
      <div className={clsx(styles.left)}>
        <div className={clsx(styles.banner)}>
          <div className={styles.bannerContent}>
            <img
              src={logo ?? "/noimg.jpg"}
              className={styles.bannerLogo}
              onError={(e) => {
                e.currentTarget.src = "/noimg.jpg";
              }}
            />
            <div className={styles.bannerText}>
              <h1
                className={clsx(
                  styles.organiserName,
                  globals[`${textColorTheme}Color`],
                )}
              >
                {title}
              </h1>
              <p className={clsx(styles.organiserName, styles.mutedColor)}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>
        <div className={clsx(styles.content)}>
          <Markdown
            className={globals[`${textColorTheme}Color`]}
            rehypePlugins={[rehypeRaw]}
          >
            {description}
          </Markdown>
        </div>
      </div>
      <div className={clsx(styles.right, spacedSidebar && styles.rightSpaced)}>
        <div className={styles.sidebarContent}>{sidebar}</div>
        {actions}
      </div>
    </div>
  );
}

export const SidebarSection = ({
  name,
  children,
}: {
  name: string;
  children?: ReactNode;
}) => {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  return (
    <div className={styles.sidebarSection}>
      <p
        className={clsx(
          styles.sidebarSectionName,
          globals.label,
          globals[`${textColorTheme}Color`],
        )}
      >
        {name}
      </p>
      {children}
    </div>
  );
};
