import { AppBar, Box, styled, Tab, Tabs, Toolbar } from "@mui/material";
import { SingleMatrix } from "../../redux/compass-api/types";
import AutoSearchInput from "../../components/auto-search-input";
import { ReactComponent as CompassLogo } from "../../assets/compass-logo.svg";

const StyledTabs = styled(Tabs)(() => ({
  "& .MuiTab-root": {
    textTransform: "revert",
  },
}));

const Header = ({
  selectedChainId,
  chains,
  onChainChanged,
  onSearchUpdated,
  searchValues,
  searchOptions,
}: {
  selectedChainId: string;
  chains: Array<SingleMatrix>;
  onChainChanged: (id: string) => void;
  onSearchUpdated: (
    values: Array<{ id: string; label: string; type: string }>
  ) => void;
  searchValues: Array<{ id: string; label: string; type: string }>;
  searchOptions: Array<{ id: string; label: string; type: string }>;
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
          <CompassLogo />
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
          <AutoSearchInput
            placeholder={"Search by protocol, token"}
            options={searchOptions}
            onSearchUpdated={onSearchUpdated}
            searchValues={searchValues}
          />
          <Box marginRight={8} />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
