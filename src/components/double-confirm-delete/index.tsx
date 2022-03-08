import DoubleConfirm from "../double-confirm";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DoubleConfirmDelete = ({
  disabled,
  onClick: onConfirmed,
}: {
  onClick: VoidFunction;
  disabled?: boolean;
}) => {
  return (
    <DoubleConfirm
      title={"Double Click Delete"}
      render={(confirmFirst, isDoubleConfirmed) => (
        <IconButton
          size={"small"}
          color={isDoubleConfirmed ? "error" : "default"}
          onClick={isDoubleConfirmed ? onConfirmed : confirmFirst}
          disabled={disabled}
        >
          <DeleteIcon fontSize={"inherit"} />
        </IconButton>
      )}
      timeout={3000}
    />
  );
};

export default DoubleConfirmDelete;
