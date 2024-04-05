import { Box, MenuItem, TextField, Theme, useMediaQuery } from "@mui/material";
import { useState } from "react";

export default function SearchAndFilter() {
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
      <TextField label="Search for game" />
      <SortDropdown />
    </Box>
  );
}

enum SortOption {
  None = "None",
  NameIncreasing = "NameIncreasing",
  NameDecreasing = "NameDecreasing",
  DateAddedIncreasing = "DateAddedIncreasing",
  DateAddedDecreasing = "DateAddedDecreasing",
  LastSavedIncreasing = "LastSavedIncreasing",
  LastSavedDecreasing = "LastSavedDecreasing",
}

function SortDropdown() {
  const [option, setOption] = useState<SortOption>();
  return (
    <>
      <TextField
        select
        value={option}
        label="Sort By"
        onChange={(evt) => setOption(evt.target.value as SortOption)}
        sx={{ minWidth: "100px" }}
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
