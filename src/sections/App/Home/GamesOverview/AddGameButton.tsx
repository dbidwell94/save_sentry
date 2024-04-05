import { Add } from "@mui/icons-material";
import { GameOverviewContainer } from "./GameOverview";
import { Divider, Typography, Box, styled } from "@mui/material";

const PlusContainer = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function AddGameButton() {
  return (
    <GameOverviewContainer elevation={10}>
      <Typography variant="h5" textAlign={"center"}>
        Add Game
      </Typography>
      <Divider />
      <PlusContainer>
        <Add sx={{ height: "64px", width: "64px" }} />
      </PlusContainer>
    </GameOverviewContainer>
  );
}
