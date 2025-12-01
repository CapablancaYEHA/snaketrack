import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "yellow",
  breakpoints: {
    xs: "30em", //576px
    sm: "48em", //768px
    md: "58em", //915px
    lg: "80em", //1280px
    xl: "90em", //1408px
  },
});

export const tabletThreshold = "(max-width: 58em)";
export const mobileThreshold = "(max-width: 48em)";
export const startSm = "(min-width: 48em)";
export const startMd = "(min-width: 58em)";
export const mediaBrowser = "(display-mode: browser)";
