import { Box, Chip, Stack, Tooltip } from "@mui/material";
import { ops } from "../operator-select";
import { StatementResult } from "../../redux/stats-api";
import { descIfStatement } from "../statement-list";

const StatementResultItem = ({ statement, op, notify }: StatementResult) => {
  return (
    <Stack direction={"row"}>
      <Tooltip
        title={
          op.status === "rejected"
            ? op.reason
            : op.value === true
            ? "true"
            : "false"
        }
      >
        <Chip
          variant={"outlined"}
          label={descIfStatement(statement)}
          sx={{ backgroundColor: "#1e1e1e", zIndex: 100 }}
          color={
            op.status === "rejected"
              ? "error"
              : op.value === true
              ? "success"
              : "default"
          }
        />
      </Tooltip>
      <Tooltip
        title={notify.status === "rejected" ? notify.reason : notify.value}
      >
        <Chip
          variant={"outlined"}
          label={`then notify ${statement.notifier}`}
          sx={{ marginLeft: "-32px", zIndex: 0, paddingLeft: "24px" }}
          color={
            notify.status === "rejected"
              ? "error"
              : notify.value === "ok"
              ? "success"
              : "default"
          }
        />
      </Tooltip>
    </Stack>
  );
};

const StatementResultList = ({
  statementResults,
}: {
  statementResults: StatementResult[];
}) => {
  return (
    <Stack paddingY={"16px"} divider={<Box marginTop={"8px"} />}>
      {statementResults
        .filter((i) => i.statement.operator in ops)
        .map((i, index) => (
          <StatementResultItem key={index} {...i} />
        ))}
    </Stack>
  );
};

export default StatementResultList;
