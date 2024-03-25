import GameOverviewContainer from "./GameOverviewContainer";

type GameOverviewProps = {
  gameName: string;
  totalSaveFiles: number;
  lastFileSavedAt?: Date;
};

export default function GameOverview(props: GameOverviewProps) {
  return (
    <GameOverviewContainer>
      <h4 className="text-gray-300 text-lg font-bold text-center">
        {props.gameName}
      </h4>
      <p className="text-gray-400 text-sm text-center">
        {props.totalSaveFiles} save files
      </p>
      <p className="text-gray-400 text-sm text-center">
        Last saved at -- <code>{props.lastFileSavedAt?.toLocaleString()}</code>
      </p>
    </GameOverviewContainer>
  );
}
