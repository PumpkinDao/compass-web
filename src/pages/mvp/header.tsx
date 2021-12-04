import { AppBar, Box, Tab, Tabs, Toolbar } from "@mui/material";
import { useCallback, useState } from "react";
import SearchInput from "../../components/search-input";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";

const TABS = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "eth",
    label: "Ethereum",
  },
  {
    id: "bsc",
    label: "Binance",
  },
  {
    id: "sol",
    label: "Solana",
  },
  {
    id: "avax",
    label: "Avalanche",
  },
  {
    id: "terra",
    label: "Terra",
  },
];

const Header = ({
  onTabSelected: onTabSelectedOuter,
}: {
  onTabSelected: (id: string) => void;
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("all");

  const onTabSelected = useCallback(
    (id: string) => {
      setSelectedTab(id);
      onTabSelectedOuter(id);
    },
    [setSelectedTab]
  );

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
          <Tabs
            variant={"fullWidth"}
            value={selectedTab}
            onChange={(_, newTabId) => onTabSelected(newTabId)}
          >
            {TABS.map((i) => (
              <Tab key={i.id} label={i.label} value={i.id} />
            ))}
          </Tabs>
          <Box flexGrow={1} />
          <SearchInput />
          <Box marginRight={8} />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
