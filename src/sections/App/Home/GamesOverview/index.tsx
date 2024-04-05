import { useAppSelector } from "@src/store";
import { configSelector } from "@src/store/selectors";
import GameOverview from "./GameOverview";
import { Box, Divider, Grid, Paper, styled } from "@mui/material";
import AddGameButton from "./AddGameButton";
import SearchAndFilter from "./SearchAndFilter";

const GamesOverviewContainer = styled(Paper)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ScrollContainer = styled(Box)`
  height: 100%;
  overflow-y: auto;
`;

const GridContainer = styled(Grid)`
  height: max-content;
`;

export default function GamesOverview() {
  const config = useAppSelector(configSelector);

  return (
    <>
      <GamesOverviewContainer>
        <SearchAndFilter />
        <Divider sx={(theme) => ({ marginY: theme.spacing() })} />
        <ScrollContainer>
          <GridContainer container spacing={2}>
            <Grid item xs={5} md={4} xl={2}>
              <AddGameButton />
            </Grid>
            {Object.values(config.games).map((gameConfig) => (
              <Grid item key={gameConfig.id} xs={5} md={4} xl={2}>
                <GameOverview gameConfig={gameConfig} />
              </Grid>
            ))}
          </GridContainer>
        </ScrollContainer>
      </GamesOverviewContainer>
    </>
  );
}
