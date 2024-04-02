import { Button, ButtonProps, ButtonTypeMap } from "@mui/material";
import { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";

type MuiLinkProps = Omit<ButtonProps<ButtonTypeMap["defaultComponent"], { to: string }>, "onClick">;
export default function MuiLink({ children, to, ...buttonProps }: PropsWithChildren<MuiLinkProps>) {
  const navigate = useNavigate();

  function onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    navigate(to);
  }

  return (
    <Button onClick={onClick} {...buttonProps}>
      {children}
    </Button>
  );
}
