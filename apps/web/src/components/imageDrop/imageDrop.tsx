"use client";

import {
  useState,
  HTMLInputTypeAttribute,
  ChangeEventHandler,
  useRef,
} from "react";
import styles from "./imageDrop.module.scss";
import globals from "styles/globals.module.scss";
import {
  Variants,
  TextVariants,
  textColor,
  inverseTextColor,
} from "types/styleTypes";
import { clsx } from "clsx";
import AddIcon from "@mui/icons-material/Add";
import { toBase64 } from "utils/mixins/helpers";
import { useFormContext } from "react-hook-form";

interface ImageDropProps {
  style?: React.CSSProperties;
  variant?: Variants;
  labelVariant?: TextVariants;
  name?: string;
  isReactFormHook?: boolean;
  reactFormHookProps?: Object;
  required?: boolean;
  className?: string;
  // eslint-disable-next-line no-unused-vars
  onFile?: (file: File) => void;
}

export default function ImageDrop({
  style,
  variant = "light",
  labelVariant,
  name = "",
  isReactFormHook = false,
  reactFormHookProps = {},
  required = false,
  className,
  onFile = () => {},
}: ImageDropProps) {
  const [file, setFile] = useState<File | null>(null);
  const methods = useFormContext();

  if (isReactFormHook && name) {
    methods.register(name, {
      required: required,
    });
  }

  const handleChange = async (_file: File) => {
    if (!_file) return;

    const b64URL = await toBase64(_file);

    name &&
      isReactFormHook &&
      methods.setValue(name, b64URL, {
        shouldValidate: true,
        shouldDirty: true,
      });
  };

  return (
    <div
      className={clsx(
        styles.wrapper,
        className,
        globals[`${variant}BackgroundColorDynamic`],
      )}
      style={style}
    >
      <label htmlFor="files" className={styles.label}>
        {file ? (
          <div
            className={clsx(styles.labelWrapper, styles.labelWrapperFile)}
            title={file.name}
          >
            <p
              className={clsx(
                globals[`${textColor(variant)}Color`],
                styles.fileText,
              )}
            >
              selected <i className={styles.italics}>{file.name}</i>
            </p>
          </div>
        ) : (
          <div className={styles.labelWrapper}>
            <AddIcon className={globals[`${textColor(variant)}FillChildren`]} />
            <p
              className={clsx(
                globals[`${textColor(variant)}Color`],
                styles.text,
              )}
            >
              select a file
              <span className={styles.desktopDragAndDrop}>
                {" "}
                or drag and drop
              </span>
            </p>
          </div>
        )}
      </label>
      <input
        type="file"
        id="files"
        className={clsx(styles.input)}
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
            onFile(e.target.files[0]);
            handleChange(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
