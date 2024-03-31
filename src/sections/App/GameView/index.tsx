import GameOverview from "@src/components/GameOverview";
import classes from "./index.module.less";
import { useAppSelector } from "@src/store";
import AddNewGameButton from "@src/components/AddNewGameButton";

export default function GameView() {
  const { games } = useAppSelector((state) => state.config);

  return (
    <div className={` w-full h-full overflow-y-auto py-2 px-1`}>
      <section className={`grid gap-4 ${classes.gameGrid} h-auto w-full`}>
        <AddNewGameButton />
        {Object.values(games).map((game) => (
          <GameOverview
            key={game.gameName}
            gameName={game.gameName}
            lastFileSavedAt={
              game.saveFiles[game.saveFiles.length - 1]?.createdAt
                ? new Date(game.saveFiles[game.saveFiles.length - 1]?.createdAt)
                : undefined
            }
            totalSaveFiles={game.saveFiles.length}
          />
        ))}
      </section>
    </div>
  );
}
