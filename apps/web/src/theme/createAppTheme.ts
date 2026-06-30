import { createTheme, type Theme } from "@mui/material/styles";

/** Calm, typography-led theme — white canvas in light mode per visit-analytics-ui-mindset. */
export function createAppTheme(mode: "light" | "dark"): Theme {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? "#1a5f8a" : "#6eb3e8",
        contrastText: "#ffffff",
      },
      success: {
        main: isLight ? "#2e7d4a" : "#5ecf8a",
      },
      warning: {
        main: isLight ? "#b45309" : "#f0a050",
      },
      text: {
        primary: isLight ? "#1a1d21" : "#e8eaed",
        secondary: isLight ? "#5c6570" : "#9aa3ad",
      },
      background: {
        default: isLight ? "#ffffff" : "#0f1114",
        paper: isLight ? "#ffffff" : "#161a20",
      },
      divider: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
      action: {
        hover: isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.06)",
        selected: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)",
      },
    },
    typography: {
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      h1: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.25 },
      h2: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.35 },
      subtitle1: { fontSize: "0.9375rem", fontWeight: 500 },
      body1: { fontSize: "0.9375rem", lineHeight: 1.5 },
      body2: { fontSize: "0.8125rem", lineHeight: 1.45 },
      caption: { fontSize: "0.75rem", lineHeight: 1.4 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minHeight: "100vh",
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: "1px solid",
            borderColor: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 500 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            fontSize: "0.75rem",
            color: isLight ? "#5c6570" : "#9aa3ad",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderLeft: "1px solid",
            borderColor: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
          },
        },
      },
    },
  });
}
