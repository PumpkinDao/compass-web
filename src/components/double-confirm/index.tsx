import React, { useCallback, useState } from "react";
import { Tooltip } from "@mui/material";

const DoubleConfirm = ({
  title,
  render,
  timeout,
}: {
  title: string;
  render: (
    confirmFirst: VoidFunction,
    isDoubleConfirmed: boolean
  ) => React.ReactElement;
  timeout: number;
}) => {
  const [isDoubleConfirmed, setIsDoubleConfirmed] = useState(false);
  const confirmFirst = useCallback(() => {
    if (!isDoubleConfirmed) {
      setIsDoubleConfirmed(true);
      setTimeout(() => setIsDoubleConfirmed(false), timeout);
    }
  }, [isDoubleConfirmed]);

  return (
    <Tooltip title={title}>{render(confirmFirst, isDoubleConfirmed)}</Tooltip>
  );
};

export default DoubleConfirm;
