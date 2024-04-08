import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Menu,
  MenuList,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { GameConfig } from "@tauri/GameConfig";
import {
  Circle,
  KeyboardArrowDown,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useState } from "react";
import MenuIcon from "@src/components/MenuIcon";
import { useNavigate } from "react-router-dom";
import { removeGame, toggleGameFileWatcher } from "@src/api";

export const GameOverviewContainer = styled(Paper)`
  width: 100%;
  min-height: ${({ theme }) => theme.spacing(30)};
  max-height: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
`;

const DataContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AnimatedCircle = styled(Circle, { shouldForwardProp: (props) => props !== "watcherEnabled" })<{
  watcherEnabled: boolean;
}>`
  animation: ${({ watcherEnabled }) => (watcherEnabled ? "pulse 1.5s infinite" : "none")};
  z-index: 1;
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(2);
      opacity: 0;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

const AnimatedArrow = styled(KeyboardArrowDown, { shouldForwardProp: (props) => props !== "open" })<{
  open?: boolean;
}>`
  transition: transform 0.3s;
  transform: rotate(${({ open }) => (open ? "180deg" : "0deg")});
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

interface GameOverviewProps {
  gameConfig: GameConfig;
}

export default function GameOverview({ gameConfig }: GameOverviewProps) {
  const { gameName, maxSaveBackups, watcherEnabled, saveFiles } = gameConfig;
  const theme = useTheme();
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const navigate = useNavigate();

  function openOptionsMenu(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setOptionsAnchor(e.currentTarget);
    setOptionsOpen(true);
  }

  function closeOptionsMenu() {
    setOptionsAnchor(null);
    setOptionsOpen(false);
  }

  async function handleEnableDisable() {
    await toggleGameFileWatcher(gameConfig.id, !watcherEnabled);
    closeOptionsMenu();
  }

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    await removeGame(gameConfig.id);
    setDeleteWarningOpen(false);
  }

  return (
    <GameOverviewContainer elevation={10}>
      {/* Delete dialog */}
      <Dialog open={deleteWarningOpen} onClose={() => setDeleteWarningOpen(false)}>
        <DialogTitle>Are you sure?</DialogTitle>
        <Divider />
        <DialogContent>
          Are you are about to delete this game config. This will delete all save backups you have. This will NOT delete
          the game save file in the game&apos;s save directory.
          <br />
          <br />
          You can add this game again by clicking &quot;Add Game&quot; on the game overview screen.
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
          <Button onClick={() => setDeleteWarningOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      {/* End Delete dialog */}

      <Typography variant="h5" textAlign={"center"}>
        {gameName}
      </Typography>
      <Divider />
      <DataContainer>
        <Typography>Max configured backups:</Typography>
        <Typography>{maxSaveBackups}</Typography>
      </DataContainer>

      <DataContainer>
        <Typography>Current backup amount:</Typography>
        <Typography>{saveFiles.length}</Typography>
      </DataContainer>

      <DataContainer>
        <Typography>Last saved:</Typography>
        <Typography>
          {saveFiles.length > 0 ? new Date(saveFiles[saveFiles.length - 1]?.createdAt).toLocaleString() : "Never"}
        </Typography>
      </DataContainer>

      <Divider sx={{ marginBottom: theme.spacing(1) }} />

      <Box display="flex" flexGrow={1} alignItems="flex-end" justifyContent="space-between" width="100%" height="100%">
        <Button variant="contained" onClick={openOptionsMenu}>
          <Typography variant="button">Options</Typography>
          <AnimatedArrow open={optionsOpen} />
        </Button>
        <Menu
          open={optionsOpen}
          onClose={closeOptionsMenu}
          anchorEl={optionsAnchor}
          slotProps={{ paper: { elevation: 20 } }}
        >
          <MenuList>
            <MenuIcon icon={AnalyticsIcon} text="Details" onClick={() => navigate(`/game/${gameConfig.id}`)} />
            <Divider />
            {watcherEnabled ? (
              <MenuIcon icon={CloseIcon} text="Disable" onClick={handleEnableDisable} />
            ) : (
              <MenuIcon text="Enable" onClick={handleEnableDisable} icon={CheckIcon} />
            )}
            <Divider />
            <MenuIcon
              color="error"
              icon={DeleteIcon}
              text="Delete"
              onClick={() => {
                setDeleteWarningOpen(true);
                closeOptionsMenu();
              }}
            />
          </MenuList>
        </Menu>

        <Tooltip title={`Game save watcher is ${watcherEnabled ? "active" : "inactive"}`}>
          <Box position={"relative"} display={"flex"}>
            <Circle color={watcherEnabled ? "success" : "error"} sx={{ position: "absolute" }} />
            <AnimatedCircle watcherEnabled={watcherEnabled} color={watcherEnabled ? "success" : "error"} />
          </Box>
        </Tooltip>
      </Box>
    </GameOverviewContainer>
  );
}
