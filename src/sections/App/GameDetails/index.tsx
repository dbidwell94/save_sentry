import Button, { ButtonColor } from "@src/components/Button";
import { useAppSelector } from "@src/store";
import { useMemo } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import { deleteSaveFile, restoreSaveFile } from "@src/api";

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

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-10">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Number
              </th>
              <th scope="col" className="px-6 py-3">
                Save Time
              </th>
              <th scope="col" className="px-6 py-3">
                Hash
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {game.saveFiles.map((saveFile, index) => (
              <tr
                key={`${saveFile.createdAt}-${saveFile.hash}`}
                className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {index + 1}
                </th>
                <td className="px-6 py-4">{new Date(saveFile.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4">{saveFile.hash}</td>
                <td className="px-6 py-4">
                  <Button
                    buttonColor={ButtonColor.Primary}
                    className="mr-1"
                    onClick={async (evt) => {
                      console.log("restoreSaveFile");
                      evt.preventDefault();
                      void (await restoreSaveFile(game.id, saveFile.saveId));
                    }}
                  >
                    Restore
                  </Button>
                  <Button
                    buttonColor={ButtonColor.Danger}
                    className="ml-1"
                    onClick={async (evt) => {
                      evt.preventDefault();
                      void (await deleteSaveFile(game.id, saveFile.saveId));
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
