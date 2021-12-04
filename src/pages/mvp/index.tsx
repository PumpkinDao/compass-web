import { Box } from "@mui/material";
import Header from "./header";
import Main from "./main";

const MVP = () => {
  return (
    <>
      <Header onTabSelected={console.log} />
      <Box marginTop={16} />
      <Main />
    </>
  );
};

export default MVP;
