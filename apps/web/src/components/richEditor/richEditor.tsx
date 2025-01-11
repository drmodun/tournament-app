"use client";

import styles from "./richEditor.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { clsx } from "clsx";
import Heading from "@tiptap/extension-heading";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TitleIcon from "@mui/icons-material/Title";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

interface RichEditorProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  startingContent?: string;
  editable?: boolean;
}

export default function RichEditor({
  style,
  variant = "dark",
  startingContent = "",
  editable = true,
}: RichEditorProps) {
  const editor = useEditor({
    editable: editable,
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content: startingContent,
    editorProps: {
      attributes: {
        class: clsx(
          styles[`${textColor(variant)}EditorColor`],
          globals[`${variant}BackgroundColor`],
          styles.editor,
        ),
      },
    },
  });

  if (!editable) return <EditorContent editor={editor} />;

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const isBoldDisabled = !editor?.can().chain().focus().toggleBold().run();

  const toggleItalics = () => editor?.chain().focus().toggleItalic().run();
  const isItalicsDisabled = !editor?.can().chain().focus().toggleItalic().run();

  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const isUnderlineDisabled = !editor
    ?.can()
    .chain()
    .focus()
    .toggleUnderline()
    .run();

  const toggleBulletList = () =>
    editor?.chain().focus().toggleBulletList().run();
  const isBulletListDisabled = !editor
    ?.can()
    .chain()
    .focus()
    .toggleBulletList()
    .run();

  const toggleHeading = () =>
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const isHeadingDisabled = !editor
    ?.can()
    .chain()
    .focus()
    .toggleHeading({ level: 1 })
    .run();

  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const isStrikeDisabled = !editor?.can().chain().focus().toggleStrike().run();

  const undo = () => editor?.chain().focus().undo().run();
  const isUndoDisabled = !editor?.can().chain().focus().undo().run();

  const redo = () => editor?.chain().focus().redo().run();
  const isRedoDisabled = !editor?.can().chain().focus().redo().run();

  return (
    <div className={clsx(styles.wrapper)}>
      <div className={clsx(styles.menuBar)}>
        <div className={clsx(styles.menuBarPart)}>
          <button
            title="menu button"
            onClick={toggleBold}
            disabled={isBoldDisabled}
            className={clsx(
              editor?.isActive("bold")
                ? [styles.boldActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],
              styles.menuButton,
            )}
          >
            <FormatBoldIcon
              className={clsx(
                editor?.isActive("bold")
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>

          <button
            title="menu button"
            onClick={toggleItalics}
            disabled={isItalicsDisabled}
            className={clsx(
              editor?.isActive("italic")
                ? [styles.italicActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],

              styles.menuButton,
            )}
          >
            <FormatItalicIcon
              className={clsx(
                editor?.isActive("italic")
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>
          <button
            title="menu button"
            onClick={toggleStrike}
            disabled={isStrikeDisabled}
            className={clsx(
              editor?.isActive("strike")
                ? [styles.strikeActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],

              styles.menuButton,
            )}
          >
            <FormatStrikethroughIcon
              className={clsx(
                editor?.isActive("strike")
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>
          <button
            title="menu button"
            onClick={toggleUnderline}
            disabled={isUnderlineDisabled}
            className={clsx(
              editor?.isActive("underline")
                ? [styles.UnderlineActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],

              styles.menuButton,
            )}
          >
            <FormatUnderlinedIcon
              className={clsx(
                editor?.isActive("underline")
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>
        </div>
        <div className={clsx(styles.menuBarPart)}>
          <button
            title="menu button"
            onClick={toggleBulletList}
            disabled={isBulletListDisabled}
            className={clsx(
              editor?.isActive("bulletList")
                ? [styles.bulletListActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],

              styles.menuButton,
            )}
          >
            <FormatListBulletedIcon
              className={clsx(
                editor?.isActive("bulletList")
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>
          <button
            title="menu button"
            onClick={toggleHeading}
            disabled={isHeadingDisabled}
            className={clsx(
              editor?.isActive("heading", { level: 1 })
                ? [styles.headingActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],

              styles.menuButton,
            )}
          >
            <TitleIcon
              className={clsx(
                editor?.isActive("heading", { level: 1 })
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>
          <button
            title="menu button"
            onClick={undo}
            disabled={isUndoDisabled}
            className={clsx(
              editor?.isActive("undo", { level: 1 })
                ? [styles.undoActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],

              styles.menuButton,
            )}
          >
            <UndoIcon
              className={clsx(
                editor?.isActive("undo", { level: 1 })
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>
          <button
            title="menu button"
            onClick={redo}
            disabled={isRedoDisabled}
            className={clsx(
              editor?.isActive("redo", { level: 1 })
                ? [styles.redoActive, globals.primaryBackgroundColor]
                : [
                    globals[`${variant}BackgroundColor`],
                    variant === "light"
                      ? styles.menuButtonLight
                      : styles.menuButtonDark,
                  ],

              styles.menuButton,
            )}
          >
            <RedoIcon
              className={clsx(
                editor?.isActive("redo", { level: 1 })
                  ? styles[`${variant}Fill`]
                  : variant === "light"
                    ? styles.menuButtonIconLight
                    : styles.menuButtonIconDark,
              )}
            />
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
