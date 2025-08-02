import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  InputAdornment,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogContentText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

function ApplicationsHistory() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const history = JSON.parse(
          localStorage.getItem("applicationHistory") || "[]"
        );

        const sortedHistory = history.sort(
          (a, b) => new Date(b.applied_at) - new Date(a.applied_at)
        );

        const formattedApplications = sortedHistory.map((app) => ({
          id: app.id || Math.floor(Math.random() * 10000),
          user_id: app.user_id || 1,
          job_url: app.url || app.job_url || "",
          status: app.status || "Unknown",
          company_name: app.company_name || "Unknown Company",
          job_title: app.job_title || "Unknown Position",
          applied_at: app.applied_at || new Date().toISOString(),
          created_at: app.created_at || new Date().toISOString(),
          updated_at: app.updated_at || new Date().toISOString(),
          questions_and_answers: app.questions_and_answers || [],
        }));

        setApplications(formattedApplications);
        setFilteredApplications(formattedApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          (app.company_name &&
            app.company_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (app.job_title &&
            app.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.job_url &&
            app.job_url.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, filterStatus, applications]);

  const viewDetails = (app) => {
    setSelectedApp(app);
    setDetailsDialogOpen(true);
  };

  const toggleExpand = (appId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
      case "success":
        return "#10b981";
      case "Failed":
      case "error":
        return "#dc2626";
      case "In Progress":
        return "#f59e0b";
      default:
        return "#000000";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Applied":
      case "success":
        return <CheckCircleIcon sx={{ color: "#10b981" }} />;
      case "Failed":
      case "error":
        return <ErrorIcon sx={{ color: "#dc2626" }} />;
      case "In Progress":
        return <InfoIcon sx={{ color: "#f59e0b" }} />;
      default:
        return <InfoIcon sx={{ color: "#000000" }} />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((app) => app.status === "Applied").length,
    failed: applications.filter(
      (app) => app.status === "Failed" || app.status === "Error"
    ).length,
    inProgress: applications.filter((app) => app.status === "In Progress")
      .length,
  };

  const openDeleteConfirm = (app) => {
    setAppToDelete(app);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!appToDelete) return;

    try {
      const history = JSON.parse(
        localStorage.getItem("applicationHistory") || "[]"
      );
      
      const updatedHistory = history.filter(app => app.id !== appToDelete.id);
      localStorage.setItem("applicationHistory", JSON.stringify(updatedHistory));
      
      const updatedApplications = applications.filter(
        app => app.id !== appToDelete.id
      );
      setApplications(updatedApplications);
      
      const updatedFilteredApplications = filteredApplications.filter(
        app => app.id !== appToDelete.id
      );
      setFilteredApplications(updatedFilteredApplications);
    } catch (error) {
      console.error("Error deleting application:", error);
    }
    
    setDeleteDialogOpen(false);
    setAppToDelete(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={4}>
        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <HistoryIcon sx={{ mr: 2, color: '#000000' }} />
                  <Typography variant="h6" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                Total Applications
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#000000" letterSpacing="-0.025em">
                {stats.total}
                </Typography>
              </CardContent>
        </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircleIcon sx={{ mr: 2, color: '#10b981' }} />
                  <Typography variant="h6" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                    Successful
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#10b981">
                {stats.applied}
                </Typography>
              </CardContent>
        </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <ErrorIcon sx={{ mr: 2, color: '#dc2626' }} />
                  <Typography variant="h6" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                    Failed
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#dc2626">
                {stats.failed}
                </Typography>
              </CardContent>
        </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUpIcon sx={{ mr: 2, color: '#f59e0b' }} />
                  <Typography variant="h6" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                In Progress
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">
                  {stats.inProgress}
                </Typography>
              </CardContent>
        </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <WorkIcon sx={{ mr: 2, color: '#000000' }} />
              <Typography variant="h5" fontWeight={600} color="#000000" letterSpacing="-0.025em">
            Application History
              </Typography>
            </Box>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                placeholder="Search by company or position"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                    },
                  }}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Error">Error</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
              {applications.length === 0
                ? "No application history yet. Start applying to jobs!"
                : "No results match your search criteria."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {filteredApplications.map((app) => (
              <Accordion
                key={app.id}
                elevation={0}
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#000000' }} />}
                  onClick={() => toggleExpand(app.id)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    {getStatusIcon(app.status)}
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                        {app.job_title || "Unknown Position"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {app.company_name || "Unknown Company"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={app.status}
                        sx={{
                          backgroundColor: getStatusColor(app.status),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                          <IconButton
                        size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewDetails(app);
                          }}
                        sx={{
                          color: '#000000',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          },
                        }}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(app);
                        }}
                        sx={{
                          color: '#dc2626',
                          '&:hover': {
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <ScheduleIcon sx={{ color: '#000000' }} />
                      <Typography variant="body2" color="text.secondary">
                        Applied on {formatDate(app.applied_at)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <LinkIcon sx={{ color: '#000000' }} />
                      <Typography 
                        variant="body2" 
                        color="#000000" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => window.open(app.job_url, '_blank')}
                      >
                        {app.job_url}
                      </Typography>
                    </Box>

                    {app.questions_and_answers && app.questions_and_answers.length > 0 && (
                      <>
                        <Divider />
                        <Typography variant="h6" fontWeight={600} mb={2} color="#000000" letterSpacing="-0.025em">
                          Application Details
                        </Typography>
                        <TableContainer component={Paper} sx={{ backgroundColor: '#ffffff' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: '#000000', fontWeight: 600 }}>Question</TableCell>
                                <TableCell sx={{ color: '#000000', fontWeight: 600 }}>Answer</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {app.questions_and_answers.map((qa, index) => (
                                <TableRow key={index}>
                                  <TableCell sx={{ color: '#000000', fontWeight: 600 }}>
                                    {qa.question}
                                  </TableCell>
                                  <TableCell sx={{ color: 'text.secondary' }}>
                                    {qa.answer}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#ffffff', color: '#000000' }}>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedApp && getStatusIcon(selectedApp.status)}
            <Typography variant="h6" fontWeight={600} letterSpacing="-0.025em">
                Application Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#ffffff', color: '#000000' }}>
          {selectedApp && (
            <Stack spacing={3} mt={2}>
                <Box>
                <Typography variant="body2" color="text.secondary">
                    Position
                </Typography>
                <Typography variant="h6" fontWeight={600} letterSpacing="-0.025em">
                    {selectedApp.job_title || "Unknown Position"}
                </Typography>
                </Box>

                <Box>
                <Typography variant="body2" color="text.secondary">
                    Company
                </Typography>
                <Typography variant="h6" letterSpacing="-0.025em">
                    {selectedApp.company_name || "Unknown Company"}
                </Typography>
                </Box>

                <Divider />

                <Box>
                <Typography variant="body2" color="text.secondary">
                    Status
                </Typography>
                <Chip
                  label={selectedApp.status}
                  sx={{
                    backgroundColor: getStatusColor(selectedApp.status),
                    color: 'white',
                    fontWeight: 600,
                    mt: 1,
                  }}
                />
                </Box>

                <Box>
                <Typography variant="body2" color="text.secondary">
                    Applied On
                </Typography>
                <Typography>
                    {new Date(selectedApp.applied_at).toLocaleString()}
                </Typography>
                </Box>

                <Box>
                <Typography variant="body2" color="text.secondary">
                    Job URL
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <LinkIcon sx={{ mr: 1, color: '#000000' }} />
                  <Typography
                    variant="body2"
                    color="#000000"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => window.open(selectedApp.job_url, '_blank')}
                    >
                      {selectedApp.job_url}
                  </Typography>
                </Box>
                </Box>

              {selectedApp.questions_and_answers && selectedApp.questions_and_answers.length > 0 && (
                <>
                <Divider />
                <Box>
                    <Typography variant="h6" fontWeight={600} mb={2} color="#000000" letterSpacing="-0.025em">
                    Submitted Information
                    </Typography>
                    <TableContainer component={Paper} sx={{ backgroundColor: '#ffffff' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#000000', fontWeight: 600 }}>Field</TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 600 }}>Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedApp.questions_and_answers.map((qa, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ color: '#000000', fontWeight: 600 }}>
                                {qa.question}
                              </TableCell>
                              <TableCell sx={{ color: 'text.secondary' }}>
                                {qa.answer}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#ffffff', p: 3 }}>
              <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={() => {
              if (selectedApp) {
                window.open(selectedApp.job_url, '_blank');
              }
            }}
            sx={{
              borderColor: '#d1d5db',
              color: '#374151',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb',
              },
            }}
              >
                Visit Job Page
              </Button>
          <Button
            variant="contained"
            onClick={() => setDetailsDialogOpen(false)}
            sx={{
              background: '#000000',
              '&:hover': {
                background: '#111827',
              },
            }}
          >
                Close
              </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ backgroundColor: '#ffffff', color: '#000000' }}>
              Delete Application
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#ffffff', color: '#000000' }}>
          <DialogContentText>
              Are you sure you want to delete this application? This action cannot be undone.
              {appToDelete && (
              <Typography variant="body1" fontWeight={600} mt={2}>
                  {appToDelete.job_title} at {appToDelete.company_name}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#ffffff', p: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
                Cancel
              </Button>
          <Button
            onClick={handleDelete}
            sx={{
              backgroundColor: '#dc2626',
              color: 'white',
              '&:hover': {
                backgroundColor: '#b91c1c',
              },
            }}
          >
                Delete
              </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApplicationsHistory;
