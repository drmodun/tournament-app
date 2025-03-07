"use client";

import { clsx } from "clsx";
import Input from "components/input";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useFormContext } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import styles from "./imagePicker.module.scss";

interface ImagePickerProps {
  style?: React.CSSProperties;
  variant?: Variants;
  name?: string;
  isReactFormHook?: boolean;
  reactFormHookProps?: Object;
  required?: boolean;
  className?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (e: string) => void;
  file?: File | string;
}

export default function ImagePicker({
  style,
  variant = "light",
  name = "",
  isReactFormHook = false,
  required = false,
  className,
  onChange = () => {},
  file,
}: ImagePickerProps) {
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotation] = useState<number>(0);

  const editor = useRef<AvatarEditor>(null);
  const methods = useFormContext();

  if (isReactFormHook && name) {
    methods.register(name, {
      required: required,
    });
  }

  const handleChange = () => {
    if (!editor.current) return;

    const b64URL = editor.current.getImageScaledToCanvas().toDataURL();
    onChange(b64URL);

    name &&
      isReactFormHook &&
      methods.setValue(name, b64URL, {
        shouldValidate: true,
        shouldDirty: true,
      });
  };

  if (!file) return;

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${variant}BackgroundColor`],
        className,
      )}
      style={style}
    >
      <AvatarEditor
        ref={editor}
        image={file}
        border={0}
        color={[255, 255, 255, 0.6]}
        scale={scale}
        rotate={rotate}
        borderRadius={125}
        className={styles.editor}
      />
      <div className={styles.sliders}>
        <Input
          type="range"
          min="1"
          max="5"
          defaultValue="1"
          step="0.1"
          className={styles.slider}
          label="scale"
          onChange={(e) => {
            setScale(parseFloat(e.target.value));
            handleChange();
          }}
          variant={textColor(variant)}
        />
        <Input
          type="range"
          min="0"
          max="360"
          defaultValue="0"
          step="1"
          className={styles.slider}
          label="rotation"
          onChange={(e) => {
            setRotation(parseInt(e.target.value));
            handleChange();
          }}
          variant={textColor(variant)}
        />
      </div>
    </div>
  );
}
