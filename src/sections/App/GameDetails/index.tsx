import Button, { ButtonColor } from "@src/components/Button";
import { useAppSelector } from "@src/store";
import { useMemo } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import { CompactTable } from "@table-library/react-table-library/compact";

export default function GameDetails() {
  const { gameId } = useParams();
  const { games } = useAppSelector((state) => state.config);
  const navigate = useNavigate();

  const game = useMemo(() => {
    return Object.values(games).find((game) => game.id === gameId);
  }, [games]);

  if (!game) {
    return <Navigate to={"/"} replace />;
  }

  return (
    <div className="w-full h-full flex items-center flex-col relative">
      <h1 className="text-white font-semibold text-3xl">{game.gameName}</h1>
      <ArrowLeftCircleIcon
        className="absolute w-10 text-white left-0 ml-8 hover:text-cyan-500 transition-all cursor-pointer"
        onClick={(evt) => {
          evt.preventDefault();
          navigate("/");
        }}
      />
      <table className="border-collapse border border-cyan-500 rounded table-auto mt-10">
        <thead>
          <tr>
            <th className="bg-cyan-500 text-white py-2 px-4">Save Time</th>
            <th className="bg-cyan-500 text-white py-2 px-4">Save Hash</th>
            <th className="bg-cyan-500 text-white py-2 px-4">Options</th>
          </tr>
        </thead>
        <tbody>
          {game.saveFiles.map((saveFile) => (
            <tr key={saveFile.hash}>
              <td className="border border-cyan-500 py-2 px-10 text-white">{saveFile.createdAt}</td>
              <td className="border border-cyan-500 py-2 px-10 text-white">{saveFile.hash}</td>
              <td className="border border-cyan-500 py-2 px-10 text-white">
                <div className="flex justify-center items-center">
                  <Button className="mr-1">Restore</Button>
                  <Button className="mr-1" buttonColor={ButtonColor.Danger}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
