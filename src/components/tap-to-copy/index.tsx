import { Typography } from "@mui/material";
import { useCallback } from "react";
import { useMessageBar } from "../../features/message-bar/hooks";

const TapToCopy = ({ content }: { content: string }) => {
  const messageBar = useMessageBar();

  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      messageBar.show("Copy to clipboard");
    } catch (e) {
      console.error(
        `Error in write text to clipboard. content: ${content}, error: `,
        e
      );
    }
  }, [messageBar, content]);

  return (
    <Typography variant={"inherit"} onClick={onClick}>
      {content}
    </Typography>
  );
};

export default TapToCopy;
