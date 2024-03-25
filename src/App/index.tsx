import { useEffect } from "react";
import Footer from "./Footer";
import GameView from "./GameView";
import Navbar from "./Navbar";
import { getConfg } from "@api/index";
import { useAppDispatch } from "@src/store";
import { updateGames } from "@state/configReducer";

export default function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    getConfg().then((config) => {
      void dispatch(updateGames(config));
    });
  }, []);

  return (
    <div className="w-full h-full bg-slate-800 flex flex-col justify-between">
      <Navbar />
      <GameView />
      <Footer />
    </div>
  );
}
