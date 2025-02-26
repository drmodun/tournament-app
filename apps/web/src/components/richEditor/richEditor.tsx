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
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

interface RichEditorProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  startingContent?: string;
  editable?: boolean;
  isSSR?: boolean;
  isReactHookForm?: boolean;
  required?: boolean;
  mobile?: boolean;
  name?: string;
}

export default function RichEditor({
  style,
  variant = "dark",
  startingContent = "",
  editable = true,
  isSSR = false,
  isReactHookForm = false,
  required = false,
  mobile = false,
  name,
}: RichEditorProps) {
  const methods = useFormContext();

  const handleChange = () => {
    isReactHookForm &&
      name &&
      methods.setValue(name, editor?.getHTML(), {
        shouldValidate: true,
        shouldDirty: true,
      });
  };

  const editor = useEditor({
    onUpdate: handleChange,
    editable: editable,
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Markdown,
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
    ],
    content: startingContent,
    immediatelyRender: !isSSR,
    editorProps: {
      attributes: {
        class: clsx(
          globals[`${variant}BackgroundColor`],
          styles.editor,
          globals[`${textColor(variant)}Color`],
        ),
      },
    },
  });

  useEffect(() => {
    if (isReactHookForm && name) {
      methods.register(name, { required: required });
      if (startingContent) {
        methods.setValue(name, editor?.getHTML(), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, []);

  if (!editable) return <EditorContent editor={editor} />;

  const toggleBold = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().toggleBold().run();
  };
  const isBoldDisabled = !editor?.can().chain().focus().toggleBold().run();

  const toggleItalics = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().toggleItalic().run();
  };
  const isItalicsDisabled = !editor?.can().chain().focus().toggleItalic().run();

  const toggleUnderline = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().toggleUnderline().run();
  };
  const isUnderlineDisabled = !editor
    ?.can()
    .chain()
    .focus()
    .toggleUnderline()
    .run();

  const toggleBulletList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().toggleBulletList().run();
  };
  const isBulletListDisabled = !editor
    ?.can()
    .chain()
    .focus()
    .toggleBulletList()
    .run();

  const toggleHeading = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  };
  const isHeadingDisabled = !editor
    ?.can()
    .chain()
    .focus()
    .toggleHeading({ level: 1 })
    .run();

  const toggleStrike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().toggleStrike().run();
  };
  const isStrikeDisabled = !editor?.can().chain().focus().toggleStrike().run();

  const undo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().undo().run();
  };
  const isUndoDisabled = !editor?.can().chain().focus().undo().run();

  const redo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    editor?.chain().focus().redo().run();
  };
  const isRedoDisabled = !editor?.can().chain().focus().redo().run();

  useEffect(() => {
    Markdown.configure({
      html: true,
      tightLists: true,
      tightListClass: "tight",
      bulletListMarker: "-",
      linkify: true,
      breaks: false,
      transformPastedText: true,
      transformCopiedText: false,
    });
  }, []);

  return (
    <div className={clsx(styles.wrapper)} style={style}>
      <div className={clsx(styles.menuBar, mobile && styles.menuBarMobile)}>
        <div
          className={clsx(
            styles.menuBarPart,
            mobile && styles.menuBarPartMobile,
          )}
        >
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
              mobile && styles.menuButtonMobile,
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
              mobile && styles.menuButtonMobile,
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
              mobile && styles.menuButtonMobile,
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
              mobile && styles.menuButtonMobile,
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
              mobile && styles.menuButtonMobile,
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
              mobile && styles.menuButtonMobile,
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
              mobile && styles.menuButtonMobile,
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
              mobile && styles.menuButtonMobile,
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
      <EditorContent editor={editor} className={styles.editor1} />
    </div>
  );
}
