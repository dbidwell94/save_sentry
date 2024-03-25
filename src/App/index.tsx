import { useEffect } from "react";
import Footer from "./Footer";
import GameView from "./GameView";
import Navbar from "./Navbar";
import { getConfg } from "@api/index";

export default function App() {
  useEffect(() => {
    getConfg().then(console.log);
  }, []);

  return (
    <div className="w-full h-full bg-slate-800 flex flex-col justify-between">
      <Navbar />
      <GameView />
      <Footer />
    </div>
  );
}
