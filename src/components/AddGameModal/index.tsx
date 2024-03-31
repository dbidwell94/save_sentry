import { useAppDispatch, useAppSelector } from "@src/store";
import Input from "../Input";
import { useEffect, useState } from "react";
import Button from "../Button";
import { setGameModalOpen } from "@src/store/modalReducer";
import * as yup from "yup";
import { addNewGame, openFolderPicker } from "@src/api";
import { listen, Event } from "@tauri-apps/api/event";

const formSchema = yup.object().shape({
  gameName: yup.string().required("Game name is required"),
  gamePath: yup.string().required("Game path is required"),
  maxSaveBackups: yup
    .number()
    .min(1, "A minimum of 1 save backup is required")
    .required("Max save backups is required"),
});

interface FormValues {
  gameName: string;
  gamePath: string;
  maxSaveBackups: number;
}

const initialFormValues: FormValues = {
  gameName: "",
  gamePath: "",
  maxSaveBackups: 0,
};

export default function AddGameModal() {
  const { createGameModalOpen } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();

  const [formValues, setFormValues] = useState(initialFormValues);

  useEffect(() => {
    let unlisten: Awaited<ReturnType<typeof listen>> | undefined;
    (async () => {
      unlisten = await listen("selected_folder", ({ payload }: Event<string | null>) => {
        if (payload) {
          setFormValues((prev) => ({
            ...prev,
            gamePath: payload,
          }));
        }
      });
    })();

    return () => {
      unlisten?.();
    };
  }, []);

  function onChange(evt: React.ChangeEvent<HTMLFormElement>) {
    evt.preventDefault();
    const { name, value } = evt.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function onSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    try {
      await formSchema.validate(formValues, { abortEarly: false });
    } catch (err) {
      /* empty */
    }

    await addNewGame(formValues.gameName, formValues.gamePath, Number(formValues.maxSaveBackups));

    dispatch(setGameModalOpen(false));
  }

  return (
    <div
      className={`absolute w-full h-full flex justify-center items-center transition-all z-10 bg-slate-900 ${
        createGameModalOpen ? "bg-opacity-60" : "bg-opacity-0 pointer-events-none"
      }`}
    >
      <section
        className={`min-w-40 max-w-96 h-auto border rounded-lg p-5 lg:p-20 bg-slate-900 ${
          createGameModalOpen ? "visible" : "hidden"
        }`}
      >
        <h1 className="text-white border-b mb-5 text-center text-xl font-bold">Add Game</h1>
        <form className="flex flex-col gap-2" onSubmit={onSubmit} onChange={onChange}>
          <Input placeholder="Game Name" name="gameName" value={formValues.gameName} />
          <Input
            placeholder="Max Save Backups"
            type="number"
            min={1}
            name="maxSaveBackups"
            value={formValues.maxSaveBackups}
          />

          <section className="w-full flex flex-col my-4 max-w-full">
            <Button
              onClick={async (e) => {
                e.preventDefault();
                await openFolderPicker();
              }}
            >
              Choose save folder
            </Button>
            {formValues.gamePath && <code className="text-white truncate">{formValues.gamePath}</code>}
          </section>

          <div className="flex gap-2 justify-center">
            <Button type="submit">Add</Button>
            <Button
              onClick={(evt) => {
                evt.preventDefault();
                setFormValues(initialFormValues);
                dispatch(setGameModalOpen(false));
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
