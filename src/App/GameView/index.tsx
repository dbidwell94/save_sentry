import GameOverview from "@src/components/GameOverview";
import classes from "./index.module.less";
import { useAppSelector } from "@src/store";
import { useMemo } from "react";
import { GameConfig } from "@src/store/configReducer";

export default function GameView() {
  const { games } = useAppSelector((state) => state.config);

  const sortedGames = useMemo(() => {
    // sort games by the save states that were last updated
    return Object.entries(games).reduce<Record<string, GameConfig>>(
      (acc, [gameName, game]) => {
        game.saveFiles.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        acc[gameName] = game;
        return acc;
      },
      {} as Record<string, GameConfig>
    );
  }, [games]);

  return (
    <div className={` w-full h-full overflow-y-auto py-2 px-1`}>
      <section className={`grid gap-4 ${classes.gameGrid} h-auto w-full`}>
        {Object.values(sortedGames).map((game) => (
          <GameOverview
            gameName={game.gameName}
            lastFileSavedAt={
              game.saveFiles[game.saveFiles.length - 1]?.updatedAt
                ? new Date(game.saveFiles[game.saveFiles.length - 1]?.updatedAt)
                : undefined
            }
            totalSaveFiles={game.saveFiles.length}
          />
        ))}
      </section>
    </div>
  );
}
