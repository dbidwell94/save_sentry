import { Box, MenuItem, TextField, Theme, useMediaQuery } from "@mui/material";
import { GameConfig } from "@src/tauriTypes/GameConfig";
import { useEffect, useState } from "react";

type SearchAndFilterProps = {
  setSearchText: React.Dispatch<React.SetStateAction<string | null>>;
  setSortOption: React.Dispatch<React.SetStateAction<SortOption>>;
  noMatchFound?: boolean;
};

export default function SearchAndFilter({ setSearchText, noMatchFound, setSortOption }: SearchAndFilterProps) {
  const isMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const isLg = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      p={(theme) => {
        if (isLg) return theme.spacing(0, 48);
        if (isMd) return theme.spacing(0, 24);
        return theme.spacing(0);
      }}
    >
      <TextField
        error={noMatchFound}
        helperText={noMatchFound ? "No games found" : " "}
        label="Search for game"
        onChange={(evt) => {
          if (evt.target.value === "") {
            setSearchText(null);
          }
          setSearchText(evt.target.value);
        }}
      />
      <SortDropdown setOption={setSortOption} />
    </Box>
  );
}

export enum SortOption {
  None = "None",
  NameIncreasing = "Name Increasing",
  NameDecreasing = "Name Decreasing",
  LastSavedIncreasing = "Last Saved Increasing",
  LastSavedDecreasing = "Last Saved Decreasing",
}

/**
 * Sorts the games based on the selected sort option
 */
export const sort: Record<SortOption, (a: GameConfig, b: GameConfig) => number> = {
  [SortOption.None]: () => 0,
  [SortOption.NameIncreasing]: (a, b) => a.gameName.localeCompare(b.gameName),
  [SortOption.NameDecreasing]: (a, b) => b.gameName.localeCompare(a.gameName),
  [SortOption.LastSavedIncreasing]: (a, b) => {
    const aLastSave = a.saveFiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    const bLastSave = b.saveFiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    return new Date(aLastSave?.createdAt).getTime() - new Date(bLastSave?.createdAt).getTime();
  },
  [SortOption.LastSavedDecreasing]: (a, b) => {
    const aLastSave = a.saveFiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    const bLastSave = b.saveFiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    return new Date(bLastSave?.createdAt).getTime() - new Date(aLastSave?.createdAt).getTime();
  },
};

type SortDropdownProps = {
  setOption: React.Dispatch<React.SetStateAction<SortOption>>;
};

function SortDropdown(props: SortDropdownProps) {
  const [option, setOption] = useState<SortOption>(SortOption.None);

  useEffect(() => {
    props.setOption(option);
  }, [option]);

  return (
    <>
      <TextField
        select
        value={option}
        label="Sort By"
        onChange={(evt) => setOption(evt.target.value as SortOption)}
        sx={(theme) => ({ minWidth: theme.spacing(16) })}
        helperText=" "
      >
        {Object.values(SortOption).map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}
