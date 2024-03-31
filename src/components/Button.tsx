import { PropsWithChildren, forwardRef } from "react";

type NativeButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

type ButtonProps = Omit<NativeButtonProps, "className">;

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  ({ children, ...buttonProps }, ref) => {
    return (
      <button
        ref={ref}
        {...buttonProps}
        className="p-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-none shadow-slate-400 active:bg-slate-300 active:text-black"
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
