import React from "react";

interface ButtonProps extends React.ComponentProps<"button"> {
  className?: string;
}

const Button: React.FC<ButtonProps> = (props) => {
  const { children, type = "button", ...otherProps } = props;
  const className =
    "shadow-2xl px-4 py-2 bg-white rounded hover:opacity-80" +
    " " +
    (props.className ?? "");
  return (
    <button {...otherProps} className={className} type={type}>
      {children}
    </button>
  );
};

export default Button;
