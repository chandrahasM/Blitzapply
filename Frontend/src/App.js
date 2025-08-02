import React, { useEffect, useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fade,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  Work as WorkIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Bolt as BoltIcon,
} from "@mui/icons-material";

// Import components
import ProfileForm from "./components/ProfileForm";
import JobApplicationForm from "./components/JobApplicationForm";
import ApplicationsHistory from "./components/ApplicationsHistory";

// Create a beautiful light theme inspired by Vercel
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Pure black like Vercel
      light: '#374151',
      dark: '#000000',
    },
    secondary: {
      main: '#dc2626', // Red for accents
      light: '#ef4444',
      dark: '#b91c1c',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    surface: {
      main: '#ffffff',
      light: '#fafafa',
      dark: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#000000',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#000000',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#000000',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#000000',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#000000',
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#000000',
      letterSpacing: '-0.025em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#374151',
      letterSpacing: '0em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6b7280',
      letterSpacing: '0em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: 'none',
          color: '#000000',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
          color: '#6b7280',
          letterSpacing: '0em',
          '&.Mui-selected': {
            color: '#000000',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#000000',
          height: 2,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '10px 24px',
          letterSpacing: '0em',
        },
        contained: {
          background: '#000000',
          color: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            background: '#111827',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        outlined: {
          borderColor: '#d1d5db',
          color: '#374151',
          '&:hover': {
            borderColor: '#9ca3af',
            backgroundColor: '#f9fafb',
          },
        },
        text: {
          color: '#374151',
          '&:hover': {
            backgroundColor: '#f9fafb',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#d1d5db',
            },
            '&:hover fieldset': {
              borderColor: '#9ca3af',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6b7280',
            '&.Mui-focused': {
              color: '#000000',
            },
          },
          '& .MuiInputBase-input': {
            color: '#374151',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          letterSpacing: '0em',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [value, setValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(lightTheme.breakpoints.down('md'));

  useEffect(() => {
    // Initialize empty profile if needed
    if (!localStorage.getItem("profile")) {
      const now = new Date().toISOString();
      localStorage.setItem(
        "profile",
        JSON.stringify({
          user_id: 1,
          full_name: "",
          email: "john.doe@example.com",
          phone: "",
          resume_url: "",
          linkedin_url: "",
          github_url: "",
          portfolio_url: "",
          created_at: now,
          updated_at: now,
        })
      );
    }
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const tabs = [
    { label: 'Profile', icon: <PersonIcon />, component: <ProfileForm /> },
    { label: 'Job Application', icon: <WorkIcon />, component: <JobApplicationForm /> },
    { label: 'Applications History', icon: <HistoryIcon />, component: <ApplicationsHistory /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 700, letterSpacing: '-0.025em' }}>
          <BoltIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#000000' }} />
          BlitzApply
        </Typography>
      </Box>
      <List>
        {tabs.map((tab, index) => (
          <ListItem
            key={tab.label}
            button
            onClick={(e) => handleChange(e, index)}
            selected={value === index}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: value === index ? '#000000' : '#6b7280' }}>
              {tab.icon}
            </ListItemIcon>
            <ListItemText 
              primary={tab.label}
              sx={{ 
                '& .MuiListItemText-primary': {
                  color: value === index ? '#000000' : '#374151',
                  fontWeight: value === index ? 600 : 500,
                  letterSpacing: '0em',
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 250,
                backgroundColor: '#ffffff',
                borderRight: '1px solid #e5e7eb',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Desktop Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { md: 250 },
            flexShrink: { md: 0 },
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              width: 250,
              height: '100vh',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e5e7eb',
              overflowY: 'auto',
            }}
          >
            {drawer}
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* App Bar */}
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: '#000000', letterSpacing: '-0.025em' }}>
                {tabs[value]?.label}
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Content Area */}
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Container maxWidth="lg" sx={{ height: '100%' }}>
              <Fade in timeout={300}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    minHeight: 'calc(100vh - 200px)',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 3,
                  }}
                >
                  {tabs[value]?.component}
                </Paper>
              </Fade>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
