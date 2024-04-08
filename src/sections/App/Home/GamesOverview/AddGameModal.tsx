import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  Modal as MuiModal,
  Paper,
  Snackbar,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import useTauriListen from "@src/hooks/useTauriListen";
import { ComponentProps, useCallback, useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { openFolderPicker, addNewGame } from "@api/index";

const formSchema = yup.object().shape({
  gameName: yup.string().required(),
  maxSaves: yup.number().required().positive().integer(),
  saveFolderPath: yup.string().required(),
});

const Modal = styled(MuiModal)`
  display: flex;
  justify-content: center;
  align-items: center;
  & .MuiBackdrop-root {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const initialFormValues = {
  gameName: "",
  maxSaves: 0,
  saveFolderPath: "",
};

const initialFormErrors = {
  gameName: "",
  maxSaves: "",
  saveFolderPath: "",
};

type AddGameModalProps = Omit<ComponentProps<typeof Modal>, "children">;

export default function AddGameModal(props: AddGameModalProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const [filePickedSnackbarOpen, setFilePickedSnackbarOpen] = useState(false);

  const allowSubmit = useMemo(() => {
    // validate schema and check if there are no errors
    try {
      formSchema.validateSync(formValues);
      return Object.values(formErrors).every((err) => !err);
    } catch (_) {
      return false;
    }
  }, [formValues, formErrors]);

  const eventCallback = useCallback(
    (data: string | null) => {
      if (!props.open || !data) return;
      setFormValues((prev) => ({ ...prev, saveFolderPath: data }));
      setFilePickedSnackbarOpen(true);
    },
    [props.open],
  );

  // Listen for the selected folder event from the backend, indicating the user has selected a valid folder from the OS's native file picker
  useTauriListen<string | null>("selected_folder", eventCallback);

  useEffect(() => {
    if (!props.open) {
      setFormValues(initialFormValues);
      setFormErrors(initialFormErrors);
      setFilePickedSnackbarOpen(false);
    }
  }, [props.open]);

  function onChange(alterationFunction?: (val: string | number) => string | number) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const newFormValues = { ...formValues, [name]: alterationFunction ? alterationFunction(value) : value };

      setFormValues(newFormValues);

      formSchema
        .validateAt(name, newFormValues)
        .then(() => {
          setFormErrors((prev) => ({ ...prev, [name]: "" }));
        })
        .catch((err) => {
          setFormErrors((prev) => ({ ...prev, [name]: err.errors[0] }));
        });
    };
  }

  async function onSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (!allowSubmit) return;
    await addNewGame(formValues.gameName, formValues.saveFolderPath, formValues.maxSaves);
    props.onClose?.(e, "escapeKeyDown");
  }

  return (
    <Modal {...props}>
      <Paper sx={(theme) => ({ p: theme.spacing(2) })} elevation={5}>
        <Snackbar
          open={filePickedSnackbarOpen}
          onClose={() => setFilePickedSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setFilePickedSnackbarOpen(false)}
          >{`Picked folder: ${formValues.saveFolderPath}`}</Alert>
        </Snackbar>

        <FormControl sx={(theme) => ({ ".MuiTextField-root": { mb: theme.spacing(2) } })}>
          <Typography variant="h4" textAlign="center">
            Add Game
          </Typography>
          <Divider sx={(theme) => ({ m: theme.spacing(1, 0) })} />
          <TextField
            helperText={formErrors.gameName || " "}
            error={Boolean(formErrors.gameName)}
            label="Game Name"
            name="gameName"
            onChange={onChange(String)}
            value={formValues.gameName}
          />
          <TextField
            helperText={formErrors.maxSaves || " "}
            error={Boolean(formErrors.maxSaves)}
            label="Max saves"
            type="number"
            name="maxSaves"
            onChange={onChange(Number)}
            value={formValues.maxSaves}
          />
          <Button
            variant="contained"
            sx={(theme) => ({ mb: theme.spacing(2) })}
            onClick={(e) => {
              e.preventDefault();
              openFolderPicker();
            }}
          >
            Save File Location
          </Button>
          <Box display="flex" justifyContent="space-between" px={(theme) => theme.spacing(2)}>
            <Button type="submit" variant="contained" disabled={!allowSubmit} onClick={onSubmit}>
              Add
            </Button>
            <Button color="error" onClick={(e) => props.onClose?.(e, "escapeKeyDown")}>
              Cancel
            </Button>
          </Box>
        </FormControl>
      </Paper>
    </Modal>
  );
}
