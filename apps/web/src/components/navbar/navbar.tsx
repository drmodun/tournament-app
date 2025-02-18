"use client";

import styles from "./navbar.module.scss";
import globals from "styles/globals.module.scss";
import { TextVariants } from "types/styleTypes";
import clsx from "clsx";
import Input from "components/input";
import Dropdown from "components/dropdown";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useEffect } from "react";

export interface NavbarProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
  searchClassName?: string;
  searchVariant?: TextVariants;
}

export default function Navbar({
  style,
  variant = "light",
  className,
  searchClassName,
  searchVariant,
}: NavbarProps) {
  const { data, isSuccess, isLoading, isError } = useAuth();

  useEffect(() => {
    console.log("THIS THE DATA", isSuccess, isLoading, data);
  }, [data, isSuccess, isLoading]);

  return (
    <div
      className={clsx(
        className,
        styles.wrapper,
        globals[`${variant + "Muted"}BackgroundColor`],
      )}
      style={style}
    >
      <img
        className={styles.profilePicture}
        src="https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287"
      />
      <p>{`AAAAAAAAAAAAAAAAAAa ${isSuccess}, ${isLoading}, ${isError}, ${data?.email}, ${data?.followers}, ${data?.following}, ${data?.id}, ${data?.name}`}</p>

      <div className={styles.interactiveSection}>
        <Input
          placeholder="search..."
          variant={searchVariant == null ? variant : searchVariant}
          className={searchClassName}
        />
        <div style={{ width: 56 }}>
          <Dropdown
            options={[
              { label: "navLinkOne" },
              {
                label: "navLinkTwo",
              },
            ]}
            selectButtonStyle={{ width: 0 }}
            arrowed={false}
            optionWrapperClassName={styles.optionWrapper}
            selectionBased={false}
            variant={variant}
          >
            <img
              className={styles.logo}
              src="https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287"
            />
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
