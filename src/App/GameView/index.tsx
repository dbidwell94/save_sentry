import GameOverview from "@src/components/GameOverview";
import classes from "./index.module.less";
import { useAppSelector } from "@src/store";

export default function GameView() {
  const { games } = useAppSelector((state) => state.config);

  return (
    <div className={` w-full h-full overflow-y-auto py-2 px-1`}>
      <section className={`grid gap-4 ${classes.gameGrid} h-auto w-full`}>
        {Object.values(games).map((game) => (
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
