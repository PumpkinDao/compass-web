import DoubleConfirm from "../double-confirm";
import { IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

const DoubleConfirmDelete = ({
  disabled,
  onClick: onConfirmed,
  size,
}: {
  onClick: VoidFunction;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}) => {
  return (
    <DoubleConfirm
      title={"Double Click Delete"}
      render={(confirmFirst, isDoubleConfirmed) => (
        <IconButton
          size={size ?? "small"}
          color={isDoubleConfirmed ? "warning" : "default"}
          onClick={isDoubleConfirmed ? onConfirmed : confirmFirst}
          disabled={disabled}
        >
          <CancelIcon fontSize={"inherit"} />
        </IconButton>
      )}
      timeout={3000}
    />
  );
};

export default DoubleConfirmDelete;
