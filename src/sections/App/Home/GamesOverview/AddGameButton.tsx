import { Add } from "@mui/icons-material";
import { Divider, Typography, Box, styled, ButtonBase } from "@mui/material";

const PlusContainer = styled(Box)`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled(ButtonBase)`
  width: 100%;
  min-height: ${({ theme }) => theme.spacing(30)};
  max-height: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.palette.grey[800]};
`;

type AddGameButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function AddGameButton(props: AddGameButtonProps) {
  return (
    <Container onClick={props.onClick}>
      <Typography variant="h5" textAlign={"center"}>
        Add Game
      </Typography>
      <Divider />
      <PlusContainer>
        <Add sx={{ height: "64px", width: "64px" }} />
      </PlusContainer>
    </Container>
  );
}
