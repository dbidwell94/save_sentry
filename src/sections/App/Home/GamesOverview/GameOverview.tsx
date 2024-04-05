import { Box, Button, Divider, Paper, Tooltip, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { GameConfig } from "@tauri/GameConfig";
import { Circle, KeyboardArrowDown } from "@mui/icons-material";

export const GameOverviewContainer = styled(Paper)`
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
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

interface GameOverviewProps {
  gameConfig: GameConfig;
}

export default function GameOverview({ gameConfig }: GameOverviewProps) {
  const { gameName, maxSaveBackups, watcherEnabled, saveFiles } = gameConfig;
  const theme = useTheme();

  function openOptionsMenu(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
  }

  return (
    <GameOverviewContainer elevation={10}>
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

      <Divider sx={{ marginBottom: theme.spacing(1) }} />

      <Box display="flex" alignItems="flex-end" justifyContent="space-between" width="100%">
        <Button variant="contained" onClick={openOptionsMenu}>
          <Typography variant="button">Options</Typography>
          <KeyboardArrowDown />
        </Button>

        <Tooltip title={`${watcherEnabled ? "Watching" : "Not watching"} game save location`}>
          <Box position={"relative"} display={"flex"}>
            <Circle color={watcherEnabled ? "success" : "error"} sx={{ position: "absolute" }} />
            <AnimatedCircle watcherEnabled={watcherEnabled} color={watcherEnabled ? "success" : "error"} />
          </Box>
        </Tooltip>
      </Box>
    </GameOverviewContainer>
  );
}
