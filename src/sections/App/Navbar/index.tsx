import {
  AppBar,
  Button,
  Container,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
} from "@mui/material";
import styled from "@emotion/styled";
import { useState } from "react";
import { Settings, Add, Close } from "@mui/icons-material";

const MaxContainer = styled(Container)`
  width: 100%;
`;

export default function Navbar() {
  return (
    <AppBar position="static">
      <MaxContainer maxWidth={false}>
        <Toolbar disableGutters>
          <GameMenu />
        </Toolbar>
      </MaxContainer>
    </AppBar>
  );
}

function GameMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  }

  function handleClose(evt: React.MouseEvent<HTMLElement, MouseEvent>) {
    evt.preventDefault();
    setAnchorEl(null);
  }

  return (
    <div>
      <Button onClick={handleClick}>Menu</Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{ paper: { elevation: 0, sx: { "paddingY": 0, ".MuiList-root": { padding: 0 } } } }}
      >
        <Paper>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText>Add new Game</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Close />
            </ListItemIcon>
            <ListItemText>Quit</ListItemText>
          </MenuItem>
        </Paper>
      </Menu>
    </div>
  );
}
