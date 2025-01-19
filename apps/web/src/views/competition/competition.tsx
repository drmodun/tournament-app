import styles from "./competition.module.scss";
import globals from "styles/globals.module.scss";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import { formatDateTime } from "utils/mixins/formatting";
import Markdown from "react-markdown";
import getUnicodeFlagIcon from "country-flag-icons/unicode";

type SidebarSectionProps = {
  name: string;
  children?: React.ReactNode;
};

export default function Competition() {
  return (
    <div className={clsx(styles.wrapper)}>
      <div className={clsx(styles.left)}>
        <div className={clsx(styles.banner)}>
          <div className={styles.bannerContent}>
            <img
              src="https://images.contentstack.io/v3/assets/bltcedd8dbd5891265b/blt5f18c2119ce26485/6668df65db90945e0caf9be6/beautiful-flowers-lotus.jpg?q=70&width=3840&auto=webp"
              alt="tournament logo"
              className={styles.bannerLogo}
            />
            <div className={styles.bannerText}>
              <h1 className={styles.organiserName}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                euismod sem dolor, in fermentum libero mattis sit amet. Etiam
                dapibus, mauris nec sollicitudin eleifend, tellus augue mollis
                odio, a iaculis nunc est nec est. Etiam egestas, tellus eu
                laoreet accumsan, risus ipsum elementum libero, eu molestie quam
                lacus nec risus.
              </h1>
              <p className={clsx(styles.organiserName, styles.mutedColor)}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                euismod sem dolor, in fermentum libero mattis sit amet. Etiam
                dapibus, mauris nec sollicitudin eleifend, tellus augue mollis
                odio, a iaculis nunc est nec est. Etiam egestas, tellus eu
                laoreet accumsan, risus ipsum elementum libero, eu molestie quam
                lacus nec risus.
              </p>
            </div>
          </div>
        </div>
        <div className={clsx(styles.content)}>
          <Markdown>{`# A demo of \`react-markdown\`

\`react-markdown\` is a markdown component for React.

👉 Changes are re-rendered as you type.

👈 Try writing some markdown on the left.

## Overview

* Follows [CommonMark](https://commonmark.org)
* Optionally follows [GitHub Flavored Markdown](https://github.github.com/gfm/)
* Renders actual React elements instead of using \`dangerouslySetInnerHTML\`
* Lets you define your own components (to render \`MyHeading\` instead of \`'h1'\`)
* Has a lot of plugins

## Contents

Here is an example of a plugin in action
**This section is replaced by an actual table of contents**.

## Syntax highlighting

Here is an example of a plugin to highlight code:

Pretty neat, eh?

## GitHub flavored markdown (GFM)

For GFM, you can *also* use a plugin:
It adds support for GitHub-specific extensions to the language:
tables, strikethrough, tasklists, and literal URLs.

These features **do not work by default**.
👆 Use the toggle above to add the plugin.

| Feature    | Support              |
| ---------: | :------------------- |
| CommonMark | 100%                 |

~~strikethrough~~

* [ ] task list
* [x] checked item

https://example.com


***

A component by [Espen Hovlandsdal](https://espen.codes/)
// # A demo of \`react-markdown\`

\`react-markdown\` is a markdown component for React.

👉 Changes are re-rendered as you type.

👈 Try writing some markdown on the left.

## Overview

* Follows [CommonMark](https://commonmark.org)
* Optionally follows [GitHub Flavored Markdown](https://github.github.com/gfm/)
* Renders actual React elements instead of using \`dangerouslySetInnerHTML\`
* Lets you define your own components (to render \`MyHeading\` instead of \`'h1'\`)
* Has a lot of plugins

## Contents

Here is an example of a plugin in action
**This section is replaced by an actual table of contents**.

## Syntax highlighting

Here is an example of a plugin to highlight code:

Pretty neat, eh?

## GitHub flavored markdown (GFM)

For GFM, you can *also* use a plugin:
It adds support for GitHub-specific extensions to the language:
tables, strikethrough, tasklists, and literal URLs.

These features **do not work by default**.
👆 Use the toggle above to add the plugin.

| Feature    | Support              |
| ---------: | :------------------- |
| CommonMark | 100%                 |

~~strikethrough~~

* [ ] task list
* [x] checked item

https://example.com


***

A component by [Espen Hovlandsdal](https://espen.codes/)
// `}</Markdown>
        </div>
      </div>
      <div className={clsx(styles.right)}>
        <div className={styles.sidebarContent}>
          <SidebarSection name="date">
            <div className={styles.dates}>
              <Chip label={formatDateTime(new Date())}></Chip>
              <p>-</p>
              <Chip label={formatDateTime(new Date())}></Chip>
            </div>
          </SidebarSection>
          <SidebarSection name="contestants (99+)">
            <div className={styles.contestantsList}>
              <Chip label="contestant number one">
                <img
                  src="https://images.contentstack.io/v3/assets/bltcedd8dbd5891265b/blt5f18c2119ce26485/6668df65db90945e0caf9be6/beautiful-flowers-lotus.jpg?q=70&width=3840&auto=webp"
                  alt=""
                  className={styles.pfp}
                />
              </Chip>
              <Chip label="contestant number two">
                <img
                  src="https://images.contentstack.io/v3/assets/bltcedd8dbd5891265b/blt5f18c2119ce26485/6668df65db90945e0caf9be6/beautiful-flowers-lotus.jpg?q=70&width=3840&auto=webp"
                  alt=""
                  className={styles.pfp}
                />
              </Chip>
              <Chip label="contestant number three">
                <img
                  src="https://images.contentstack.io/v3/assets/bltcedd8dbd5891265b/blt5f18c2119ce26485/6668df65db90945e0caf9be6/beautiful-flowers-lotus.jpg?q=70&width=3840&auto=webp"
                  alt=""
                  className={styles.pfp}
                />
              </Chip>
            </div>
          </SidebarSection>
          <SidebarSection name="location">
            <Chip label={`Split, HR ${getUnicodeFlagIcon("HR")}`}></Chip>
          </SidebarSection>
          <SidebarSection name="mmr">
            <div className={styles.dates}>
              <Chip label={"1924"}></Chip>
              <p>-</p>
              <Chip label={"2000"}></Chip>
            </div>
          </SidebarSection>
          <SidebarSection name="type">
            <Chip label={`programming`}></Chip>
          </SidebarSection>
          <SidebarSection name="rules">
            <ol className={styles.rulesList}>
              <li className={styles.rule}>rule number one</li>
              <li className={styles.rule}>rule number two</li>
              <li className={styles.rule}>rule number three</li>
            </ol>
          </SidebarSection>
        </div>
        <Button
          label="join competition"
          variant="primary"
          className={styles.joinButton}
        />
      </div>
    </div>
  );
}

const SidebarSection = ({ name, children }: SidebarSectionProps) => {
  return (
    <div className={styles.sidebarSection}>
      <p className={clsx(styles.sidebarSectionName, globals.label)}>{name}</p>
      {children}
    </div>
  );
};
