import { useAppSelector } from "@src/store";
import { configSelector } from "@src/store/selectors";
import GameOverview from "./GameOverview";
import { Box, Divider, Grid, Paper, styled } from "@mui/material";
import AddGameButton from "./AddGameButton";
import SearchAndFilter, { SortOption, sort } from "./SearchAndFilter";
import { useMemo, useState } from "react";

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
  const [searchText, setSearchText] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.None);

  const games = useMemo(() => {
    if (!searchText) return Object.values(config.games);
    return Object.values(config.games)
      .filter((game) => game.gameName.toLowerCase().includes(searchText.toLowerCase()))
      .sort(sort[sortOption]);
  }, [config.games, searchText]);

  return (
    <>
      <GamesOverviewContainer>
        <SearchAndFilter
          setSearchText={setSearchText}
          noMatchFound={Object.values(config.games).length > 0 && games.length === 0}
          setSortOption={setSortOption}
        />
        <Divider sx={(theme) => ({ margin: theme.spacing(0, 1, 1, 1) })} />
        <ScrollContainer>
          <GridContainer container spacing={2}>
            <Grid item xs={5} md={4} xl={2}>
              <AddGameButton />
            </Grid>
            {games.map((gameConfig) => (
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
