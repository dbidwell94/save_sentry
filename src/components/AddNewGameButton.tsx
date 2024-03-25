import { useAppDispatch } from "@src/store";
import GameOverviewContainer from "./GameOverviewContainer";
import { PlusIcon } from "@heroicons/react/24/solid";
import { setGameModalOpen } from "@src/store/modalReducer";

export default function AddNewGameButton() {
  const dispatch = useAppDispatch();
  return (
    <GameOverviewContainer onClick={() => dispatch(setGameModalOpen(true))}>
      <PlusIcon color="white" className="w-20 h-20" />
    </GameOverviewContainer>
  );
}
