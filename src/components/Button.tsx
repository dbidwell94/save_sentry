// Create a new component called Button with a forwardRef

import React, { PropsWithChildren } from "react";

type ButtonProps = {};

const Button = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>((props, ref) => {
  return <button ref={ref} {...props} />;
});

export default Button;