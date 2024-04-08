import {
  Box,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from "@mui/material";
import { deleteSaveFile, restoreSaveFile } from "@src/api";
import { useAppSelector } from "@src/store";
import { configSelector } from "@src/store/selectors";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

const GameDetailsContainer = styled(Paper)`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
`;

export default function Game() {
  const { games } = useAppSelector(configSelector);
  const { gameId } = useParams();
  const navigate = useNavigate();

  const selectedGame = useMemo(() => {
    return Object.values(games).find((game) => game.id === gameId);
  }, [games, gameId]);

  if (!selectedGame) {
    navigate("/");
    return <></>;
  }

  function handleRestoreSaveFile(saveId: string) {
    return async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      await restoreSaveFile(selectedGame!.id, saveId);
    };
  }

  function handleDeleteSaveFile(saveId: string) {
    return async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      await deleteSaveFile(selectedGame!.id, saveId);
    };
  }

  return (
    <GameDetailsContainer>
      <Typography variant="h3" textAlign="center">
        {selectedGame.gameName}
      </Typography>
      <Divider sx={(theme) => ({ mb: theme.spacing(1), width: "100%" })} />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        maxWidth={(theme) => theme.spacing(200)}
        px={(theme) => theme.spacing(10)}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time Created</TableCell>
              <TableCell>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedGame.saveFiles.map((save) => {
              return (
                <TableRow key={save.hash}>
                  <TableCell>{new Date(save.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={(theme) => ({ "*": { mx: theme.spacing(1) } })}>
                      <Button variant="contained" onClick={handleRestoreSaveFile(save.saveId)}>
                        Restore
                      </Button>
                      <Button variant="contained" color="error" onClick={handleDeleteSaveFile(save.saveId)}>
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </GameDetailsContainer>
  );
}
