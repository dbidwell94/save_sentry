import GameOverview from "@src/components/GameOverview";
import classes from "./index.module.less";

export default function GameView() {
  return (
    <div className={` w-full h-full overflow-y-auto py-2 px-1`}>
      <section className={`grid gap-4 ${classes.gameGrid} h-auto w-full`}>
        <GameOverview
          gameName="Dragon's Dogma 2"
          lastFileSavedAt={new Date()}
          totalSaveFiles={10}
        />
      </section>
    </div>
  );
}
