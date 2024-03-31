import { forwardRef } from "react";

type NativeInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

type InputProps = Omit<NativeInputProps, "className"> & {
  directory?: boolean | string;
  webkitdirectory?: boolean | string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(({ ...inputProps }, ref) => {
  return <input ref={ref} {...inputProps} className="p-2 bg-slate-800 text-white" />;
});

Input.displayName = "Input";

export default Input;
