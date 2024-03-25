import GameOverviewContainer from "./GameOverviewContainer";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function AddNewGameButton() {
  return (
    <GameOverviewContainer>
      <PlusIcon color="white" className="w-20 h-20" />
    </GameOverviewContainer>
  );
}
