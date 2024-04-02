import { useEffect } from "react";
import Footer from "./Footer";
import GamesOverview from "./GamesOverview";
import Navbar from "./Navbar";
import { getConfg } from "@api/index";
import { useAppDispatch } from "@src/store";
import { updateGames } from "@state/configReducer";
import { listen } from "@tauri-apps/api/event";
import AddGameModal from "@src/components/AddGameModal";
import { Routes, Route } from "react-router-dom";
import GameDetails from "./GameDetails";
import styled from "@emotion/styled";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    getConfg().then((config) => {
      void dispatch(updateGames(config));
    });
  }, []);

  useEffect(() => {
    let unlisten: Awaited<ReturnType<typeof listen>> | undefined = undefined;
    (async () => {
      unlisten = await listen("configUpdated", () => {
        getConfg().then((config) => {
          void dispatch(updateGames(config));
        });
      });
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <AppContainer>
      {/* <AddGameModal /> */}
      <Navbar />
      <Routes>
        <Route path="/game-details/:gameId" element={<GameDetails />} />
        <Route path="/" element={<GamesOverview />} />
      </Routes>
      <Footer />
    </AppContainer>
  );
}
