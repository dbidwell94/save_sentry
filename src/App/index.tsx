import Footer from "./Footer";
import GameView from "./GameView";
import Navbar from "./Navbar";

export default function App() {
  return (
    <div className="w-full h-full bg-slate-800 flex flex-col justify-between">
      <Navbar />
      <GameView />
      <Footer />
    </div>
  );
}
