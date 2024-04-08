import { useEffect } from "react";
import { getConfg } from "@api/index";
import { useAppDispatch } from "@src/store";
import { updateGames } from "@state/configReducer";
import styled from "@emotion/styled";
import useTauriListen from "@src/hooks/useTauriListen";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Game from "./Game";
import Sidebar from "@src/components/Sidebar";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

export default function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    getConfg().then((config) => {
      void dispatch(updateGames(config));
    });
  }, []);

  useTauriListen<void>("configUpdated", () => {
    getConfg().then((config) => {
      void dispatch(updateGames(config));
    });
  });

  return (
    <AppContainer>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<Game />} />
      </Routes>
    </AppContainer>
  );
}
