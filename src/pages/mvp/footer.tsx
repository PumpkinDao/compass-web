import { Box, Divider, Link, Stack, styled, Typography } from "@mui/material";
import { Copyright } from "@mui/icons-material";
import { ReactComponent as DiscordIcon } from "../../assets/discord.svg";
import { ReactComponent as GithubIcon } from "../../assets/github.svg";
import { ReactComponent as TwitterIcon } from "../../assets/twitter.svg";
import React from "react";

const StyledContainer = styled(Stack)(() => ({
  "& .smallFont": {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  "& .smallIcon": {
    width: 20,
    height: 20,
  },
}));

const SocialIcon = ({
  svg: SVG,
  link,
}: {
  svg: React.JSXElementConstructor<{ className: string; fill: string }>;
  link: string;
}) => (
  <Link href={link} target={"_blank"} underline={"none"}>
    <SVG className={"smallIcon"} fill={"rgba(255, 255, 255, 0.5)"} />
  </Link>
);

const Footer = () => (
  <StyledContainer>
    <Divider />
    <Box marginTop={6} />
    <Stack direction={"row"} justifyContent={"space-between"}>
      <Stack direction={"row"} alignItems={"center"}>
        <Copyright className={"smallFont"} />
        <Box marginRight={1} />
        <Typography className={"smallFont"}>2021 CompassDAO</Typography>
      </Stack>
      <Stack direction={"row"} alignItems={"center"}>
        <SocialIcon link={"https://github.com/compassdao"} svg={GithubIcon} />
        <Box marginRight={2} />
        <SocialIcon link={"https://twitter.com/compassdao"} svg={TwitterIcon} />
        <Box marginRight={2} />
        <SocialIcon link={"https://discord.gg/bG89QDHyVZ"} svg={DiscordIcon} />
      </Stack>
    </Stack>
    <Box marginTop={6} />
  </StyledContainer>
);

export default Footer;
