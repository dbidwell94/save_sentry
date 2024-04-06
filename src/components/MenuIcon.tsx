import type { Abc } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem, Typography } from "@mui/material";
import { ComponentProps } from "react";

type MenuIconProps = {
  icon: typeof Abc;
  text: string;
  color?: ComponentProps<typeof Abc>["color"];
} & ComponentProps<typeof MenuItem>;

export default function MenuIcon({ icon: Icon, color, text, ...menuItemProps }: MenuIconProps) {
  return (
    <MenuItem {...menuItemProps}>
      <ListItemIcon>
        <Icon color={color} />
      </ListItemIcon>
      <ListItemText>
        <Typography color={color}>{text}</Typography>
      </ListItemText>
    </MenuItem>
  );
}
