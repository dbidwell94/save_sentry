import { useAppSelector } from "@src/store";
import Input from "../Input";
import { useState } from "react";
import Button from "../Button";

interface FormValues {
  gameName: string;
  gamePath: string;
  maxSaveBackups: number;
}

export default function AddGameModal() {
  const { createGameModalOpen } = useAppSelector((state) => state.modals);

  const [formValues, setFormValues] = useState();

  return (
    <div
      className={`absolute w-full h-full flex justify-center items-center transition-all bg-slate-900 ${
        createGameModalOpen
          ? "bg-opacity-60"
          : "bg-opacity-0 pointer-events-none"
      }`}
    >
      <section className="min-w-40 h-auto border rounded-lg p-5 lg:p-20">
        <h1 className="text-white border-b mb-5">Add Game</h1>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input placeholder="Game Name" />
          <Input placeholder="Max Save Backups" type="number" min={0} />

          <Input
            placeholder="Game Path"
            type="file"
            directory
            webkitdirectory
            multiple
          />
          <div className="flex gap-2 justify-center">
            <Button type="submit">Add</Button>
            <Button>Cancel</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
