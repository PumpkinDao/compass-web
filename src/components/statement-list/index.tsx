import { Box, Button, Chip, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ops } from "../operator-select";
import { Statement } from "../../redux/stats-api";
import { useCallback, useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";

const StatementItem = ({
  keyword,
  operator,
  expect,
  notifier,
  onDeleteClick,
  notifyMsg,
  throttleTimeout,
  isDeleting,
}: Statement & {
  onDeleteClick: VoidFunction;
  isDeleting: boolean;
}) => {
  const [doubleConfirming, setDoubleConfirming] = useState<boolean>(false);
  const onDelete = useCallback(() => {
    if (isDeleting) {
      return;
    } else if (!doubleConfirming) {
      setDoubleConfirming(true);
      setTimeout(() => setDoubleConfirming(false), 3000);
      return;
    }
    onDeleteClick();
  }, [doubleConfirming, onDeleteClick, isDeleting]);

  keyword = keyword === "." ? "value" : keyword;

  return (
    <Tooltip
      title={`with "${notifyMsg}" in every ${
        throttleTimeout / 60000
      } minute(s)`}
    >
      <Stack direction={"row"}>
        <Chip
          variant={"outlined"}
          label={`
        If ${keyword} ${ops[operator].indicator} ${expect} 
      `}
          sx={{ backgroundColor: "#1e1e1e", zIndex: 100 }}
          color={doubleConfirming ? "warning" : "default"}
        />
        <Chip
          variant={"outlined"}
          label={`then notify ${notifier}`}
          sx={{ marginLeft: "-32px", zIndex: 0, paddingLeft: "24px" }}
          color={doubleConfirming ? "warning" : "default"}
          onDelete={onDelete}
          deleteIcon={
            isDeleting ? (
              <PendingIcon />
            ) : (
              <Tooltip
                title={"Double Click Delete"}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                open={doubleConfirming}
              >
                <CancelIcon />
              </Tooltip>
            )
          }
        />
      </Stack>
    </Tooltip>
  );
};

const NewStatementBtn = ({ onClick }: { onClick: VoidFunction }) => (
  <Button
    size={"small"}
    variant={"outlined"}
    onClick={onClick}
    sx={{ borderRadius: "100px", width: "200px" }}
    endIcon={<AddIcon />}
  >
    New Statement
  </Button>
);

const StatementList = ({
  statements,
  onDeleteStatementClick,
  deletingId,
  onNewStatementClick,
}: {
  statements: Statement[];
  onDeleteStatementClick: (id: number) => void;
  deletingId: number;
  onNewStatementClick: Parameters<typeof NewStatementBtn>[0]["onClick"];
}) => {
  return (
    <Stack padding={"16px"} divider={<Box marginTop={"8px"} />}>
      {statements.map((i) => (
        <StatementItem
          key={i.id}
          {...i}
          onDeleteClick={() => onDeleteStatementClick(i.id)}
          isDeleting={deletingId === i.id}
        />
      ))}
      <NewStatementBtn onClick={onNewStatementClick} />
    </Stack>
  );
};

export default StatementList;
