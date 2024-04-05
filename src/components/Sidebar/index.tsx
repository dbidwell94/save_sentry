import {
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CSSObject, Theme, styled } from "@mui/material/styles";
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { useState } from "react";

interface SidebarOption {
  label: string;
  icon: typeof HomeIcon;
  path: string;
}

const drawerWidth = 240;

const DrawerHeader = styled("div")<{ open?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ open }) => (open ? "flex-end" : "center")};
  padding: ${({ theme }) => theme.spacing(0, 1)};
  ${({ theme }) => theme.mixins.toolbar};
`;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  position: "absolute",
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

/**
 * This "GhostDrawer" is used to keep the layout consistent when the sidebar is closed.
 * It is a placeholder that takes up the same space as the sidebar, has no content, and just pushes over the main content.
 */
const GhostDrawer = styled("div")(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...closedMixin(theme),
}));

const topSidebarOptions: SidebarOption[] = [
  {
    label: "Games Overview",
    icon: HomeIcon,
    path: "/",
  },
  {
    label: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  function handleDrawerOpenToggle(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setOpen((o) => !o);
  }

  function onMenuLinkPressed() {
    setOpen(false);
  }

  return (
    <>
      <GhostDrawer />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader open={open}>
          <IconButton onClick={handleDrawerOpenToggle}>{open ? <ChevronLeftIcon /> : <MenuIcon />}</IconButton>
        </DrawerHeader>
        <Divider />
        {topSidebarOptions.map((option) => {
          return (
            <ListItem key={option.label} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={NavLink}
                to={option.path}
                sx={{ minHeight: 48, px: 2.5, justifyContent: open ? "initial" : "center" }}
                onClick={onMenuLinkPressed}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <option.icon />
                </ListItemIcon>
                <ListItemText primary={option.label} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </Drawer>
    </>
  );
}
