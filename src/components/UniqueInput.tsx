import React, { forwardRef, useMemo, useRef, useEffect } from "react";
import { useFormContext } from "../models";

interface InputProps
  extends Omit<React.ComponentPropsWithRef<"input">, "name"> {
  name: string;
}

const UniqueInput: React.FC<InputProps> = forwardRef((props, ref) => {
  const {
    formState: { errors },
    clearErrors,
  } = useFormContext();
  const { name } = props;
  const error = useMemo(() => (errors as any)[name], [name, errors]);
  const inputRef = useRef<HTMLInputElement>(null!);
  const refCallback = (element: HTMLInputElement) => {
    inputRef.current = element;
    if (ref) {
      if (typeof ref === "function") {
        ref(element);
      } else {
        ref.current = element;
      }
    }
  };
  useEffect(() => {
    if (error?.type === "duplicate") {
      inputRef.current?.setCustomValidity(error.message);
      inputRef.current?.reportValidity();
    }
    return () => inputRef.current?.setCustomValidity("");
  }, [error]);
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (error) {
      clearErrors();
    }
    props.onBlur?.(e);
  };
  return (
    <input autoComplete="off" {...props} ref={refCallback} onBlur={onBlur} />
  );
});

export default UniqueInput;
