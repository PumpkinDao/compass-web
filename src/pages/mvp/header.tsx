import { AppBar, Box, Tab, Tabs, Toolbar } from "@mui/material";
import SearchInput from "../../components/search-input";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import { SingleMatrix } from "../../redux/pumpkin-api/types";

const Header = ({
  selectedChainId,
  chains,
  onChainChanged,
}: {
  selectedChainId: string;
  chains: Array<SingleMatrix>;
  onChainChanged: (id: string) => void;
}) => {
  const tabs = [{ id: "all", name: "All" }, ...chains];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position={"static"}
        color={"transparent"}
        sx={{ boxShadow: "revert" }}
      >
        <Toolbar>
          <ExploreOutlinedIcon sx={{ fontSize: 50 }} />
          <Box marginLeft={16} />
          {Array.isArray(tabs) && tabs.length > 1 ? (
            <Tabs
              variant={"fullWidth"}
              value={selectedChainId ? selectedChainId : "all"}
              onChange={(_, tabId) =>
                onChainChanged(tabId === "all" ? "" : tabId)
              }
            >
              {tabs.map((i) => (
                <Tab key={i.id} label={i.name} value={i.id} />
              ))}
            </Tabs>
          ) : null}
          <Box flexGrow={1} />
          <SearchInput />
          <Box marginRight={8} />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
