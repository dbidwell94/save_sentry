import { PropsWithChildren, forwardRef, useMemo } from "react";

export enum ButtonColor {
  Primary = "bg-cyan-400 text-black hover:bg-cyan-500 active:bg-cyan-600",
  Secondary = "bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-900",
  Danger = "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  Success = "bg-green-500 text-white hover:bg-green-600 active:bg-green-700",
  Warning = "bg-yellow-500 text-black hover:bg-yellow-600 active:bg-yellow-700",
  Info = "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
  Light = "bg-gray-300 text-black hover:bg-gray-400 active:bg-gray-500",
  Dark = "bg-gray-800 text-white hover:bg-gray-900 active:bg-gray-900",
}

type NativeButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

type ButtonProps = NativeButtonProps & {
  buttonColor?: ButtonColor;
};

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  ({ children, buttonColor: buttonColorProp, className, ...buttonProps }, ref) => {
    const buttonColor = useMemo(() => {
      return buttonColorProp || ButtonColor.Primary;
    }, [buttonColorProp]);

    return (
      <button
        ref={ref}
        {...buttonProps}
        className={`p-2 rounded-md transition-all shadow-none shadow-slate-400 ${buttonColor} ${className}`}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
