import { AppBar, Box, styled, Tab, Tabs, Toolbar } from "@mui/material";
import SearchInput from "../../components/search-input";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import { SingleMatrix } from "../../redux/compass-api/types";

const StyledTabs = styled(Tabs)(() => ({
  "& .MuiTab-root": {
    textTransform: "revert",
  },
}));

const Header = ({
  selectedChainId,
  chains,
  onChainChanged,
  onSearchSubmit,
}: {
  selectedChainId: string;
  chains: Array<SingleMatrix>;
  onChainChanged: (id: string) => void;
  onSearchSubmit: (value: string) => void;
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
          <Box
            flexGrow={1}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            sx={{ marginLeft: 16, marginRight: 16 }}
          >
            {Array.isArray(tabs) && tabs.length > 1 ? (
              <StyledTabs
                value={selectedChainId ? selectedChainId : "all"}
                onChange={(_, tabId) =>
                  onChainChanged(tabId === "all" ? "" : tabId)
                }
              >
                {tabs.map((i) => (
                  <Tab key={i.id} label={i.name} value={i.id} />
                ))}
              </StyledTabs>
            ) : null}
          </Box>
          <SearchInput
            placeholder={"Search Protocols"}
            onSearchSubmit={onSearchSubmit}
          />
          <Box marginRight={8} />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
