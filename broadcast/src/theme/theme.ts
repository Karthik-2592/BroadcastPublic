// MUI theme configuration for Broadcast.
// Defines a dark-mode-first palette with purple accent, Inter/Roboto typography,
// and component overrides for Cards, AppBar, Buttons, etc.

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#b388ff',      // Vibrant purple accent
      light: '#c7a4ff',
      dark: '#7c4dff',
    },
    secondary: {
      main: '#69f0ae',      // Teal-green for contrast
      light: '#9fffe0',
      dark: '#2bbd7e',
    },
    background: {
      default: '#0f0f1a',   // Deep dark background
      paper: '#1a1a2e',     // Slightly lighter card/sidebar surfaces
    },
    text: {
      primary: '#e8e6ef',
      secondary: '#9e9bab',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '0.95rem',
    },
    subtitle2: {
      color: '#9e9bab',
      fontSize: '0.8rem',
    },
    body2: {
      color: '#9e9bab',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a3e #0f0f1a',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#12121f',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a2e',
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(179, 136, 255, 0.25)',
            boxShadow: '0 4px 20px rgba(179, 136, 255, 0.08)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          marginBottom: 2,
          '&.Mui-selected': {
            backgroundColor: 'rgba(179, 136, 255, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(179, 136, 255, 0.18)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.08)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(179, 136, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#b388ff',
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid rgba(179, 136, 255, 0.3)',
        },
      },
    },
  },
});

export default theme;
