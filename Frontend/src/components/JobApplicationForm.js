import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Bolt as BoltIcon,
  Visibility as VisibilityIcon,
  Computer as ComputerIcon,
} from "@mui/icons-material";
import { submitJobApplication, submitBatchJobApplications } from "../services/apiService";

function JobApplicationForm() {
  const [urls, setUrls] = useState([""]);
  const [status, setStatus] = useState("idle"); // idle, loading, completed
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', title: '', message: '' });
  const [browserViewerOpen, setBrowserViewerOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [browserLogs, setBrowserLogs] = useState([]);

  // Load user profile and custom fields on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingProfile(true);
      try {
        const savedProfile = localStorage.getItem("profile");
        const savedCustomFields = localStorage.getItem("customFields");

        if (savedProfile && savedCustomFields) {
          const profile = JSON.parse(savedProfile);
          const customFields = JSON.parse(savedCustomFields);

          // Validate that profile has required fields
          if (!profile.full_name || !profile.email) {
            setAlert({
              show: true,
              type: 'warning',
              title: 'Profile incomplete',
              message: 'Please complete your profile with at least your name and email before applying.',
            });
            return;
          }

          const userInfo = {
            profile: profile,
            custom_fields: customFields,
          };

          setUserInfo(userInfo);
        } else {
          setAlert({
            show: true,
            type: 'warning',
            title: 'Profile incomplete',
            message: 'Please complete your profile before applying to jobs.',
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setAlert({
          show: true,
          type: 'error',
          title: 'Error loading profile',
          message: error.message,
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, []);

  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  const removeUrlField = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const submitApplication = async () => {
    const validUrls = urls.filter((url) => url.trim() !== "");

    if (validUrls.length === 0) {
      setAlert({
        show: true,
        type: 'warning',
        title: 'No URLs provided',
        message: 'Please add at least one job URL to apply.',
      });
      return;
    }

    if (
      !userInfo ||
      !userInfo.profile ||
      !userInfo.profile.full_name ||
      !userInfo.profile.email
    ) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Profile incomplete',
        message: 'Please complete your profile with at least your name and email before applying.',
      });
      return;
    }

    setStatus("loading");
    setResults([]);
    setProgress(0);
    setBrowserLogs([]);

    const newResults = [];

    try {
      // Prepare profile data for backend
      const profileData = {
        ...userInfo.profile,
        user_id: 1, // Mock user ID for now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Prepare custom fields data for backend
      const customFieldsData = userInfo.custom_fields.map((field, index) => ({
        ...field,
        id: index + 1,
        user_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Submit applications one by one to show real-time progress
      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i];
        
        setCurrentApplication({
          url: url,
          index: i + 1,
          total: validUrls.length,
        });

        setProgress(Math.round(((i + 0.5) / validUrls.length) * 100));

        // Add browser log entry
        setBrowserLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: `Starting application ${i + 1}/${validUrls.length}: ${url}`,
          type: 'info'
        }]);

        try {
          // Call the Playwright backend API
          const response = await submitJobApplication(url);
          
          // Add success log
          setBrowserLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: `Successfully processed: ${response.company_name} - ${response.job_title}`,
            type: 'success'
          }]);

          newResults.push({
            id: i + 1,
            url: url,
            company_name: response.company_name || "Unknown Company",
            job_title: response.job_title || "Unknown Position",
            status: response.status || "failed",
            applied_at: new Date().toISOString(),
            questions_answered: response.questions_answered || 0,
            questions_and_answers: response.questions_and_answers || [],
            error_message: response.error_message,
            missing_fields: response.missing_fields || [],
          });

        } catch (error) {
          console.error(`Error applying to ${url}:`, error);
          
          // Add error log
          setBrowserLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: `Error applying to ${url}: ${error.message}`,
            type: 'error'
          }]);

          newResults.push({
            id: i + 1,
            url: url,
            company_name: "Unknown Company",
            job_title: "Unknown Position",
            status: "failed",
            applied_at: new Date().toISOString(),
            questions_answered: 0,
            questions_and_answers: [],
            error_message: error.message,
            missing_fields: [],
          });
        }

        setProgress(Math.round(((i + 1) / validUrls.length) * 100));
      }

      setResults(newResults);
      setStatus("completed");
      
      // Add completion log
      setBrowserLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: `All applications completed. ${newResults.filter(r => r.status === 'success').length}/${newResults.length} successful.`,
        type: 'success'
      }]);

    } catch (error) {
      console.error("Error submitting applications:", error);
      setAlert({
        show: true,
        type: 'error',
        title: 'Application Error',
        message: error.message,
      });
      setStatus("idle");
    }
  };

  const openBrowserViewer = () => {
    setBrowserViewerOpen(true);
  };

  const closeBrowserViewer = () => {
    setBrowserViewerOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#10b981";
      case "failed":
        return "#ef4444";
      case "in_progress":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon />;
      case "failed":
        return <ErrorIcon />;
      case "in_progress":
        return <CircularProgress size={20} />;
      default:
        return <WorkIcon />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Success";
      case "failed":
        return "Failed";
      case "in_progress":
        return "In Progress";
      default:
        return "Unknown";
    }
  };

  if (isLoadingProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#000000", letterSpacing: "-0.025em", mb: 3 }}>
        Job Application Automation
      </Typography>

      {/* Alert */}
      {alert.show && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 3, backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.message}
        </Alert>
      )}

      {/* URL Input Section */}
      <Card sx={{ mb: 3, backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: "#000000", letterSpacing: "-0.025em", mb: 2 }}>
            <LinkIcon sx={{ mr: 1, color: "#000000" }} />
            Job URLs
          </Typography>
          
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
            Add the URLs of job postings you want to apply to. The system will automatically fill out the application forms using your profile information.
          </Typography>

          {urls.map((url, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Job URL"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://example.com/job-posting"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: "#d1d5db",
                    },
                    "&:hover fieldset": {
                      borderColor: "#000000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000000",
                    },
                  },
                }}
              />
              {urls.length > 1 && (
                <IconButton
                  onClick={() => removeUrlField(index)}
                  sx={{ color: "#dc2626" }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addUrlField}
            variant="outlined"
            sx={{
              borderColor: "#d1d5db",
              color: "#000000",
              "&:hover": {
                borderColor: "#000000",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            Add Another URL
          </Button>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {status === "loading" && (
        <Card sx={{ mb: 3, backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CircularProgress size={24} sx={{ mr: 2, color: "#000000" }} />
              <Typography variant="h6" sx={{ color: "#000000", letterSpacing: "-0.025em" }}>
                Processing Applications...
              </Typography>
            </Box>
            
            {currentApplication && (
              <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
                Application {currentApplication.index}/{currentApplication.total}: {currentApplication.url}
              </Typography>
            )}
            
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: "#f3f4f6",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#000000",
                }
              }} 
            />
            
            <Typography variant="body2" sx={{ color: "#6b7280", mt: 1 }}>
              {progress}% Complete
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={submitApplication}
          disabled={status === "loading" || isLoadingProfile}
          startIcon={<PlayArrowIcon />}
          sx={{
            backgroundColor: "#000000",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#1f2937",
            },
            "&:disabled": {
              backgroundColor: "#d1d5db",
              color: "#6b7280",
            },
          }}
        >
          {status === "loading" ? "Processing..." : "Start Applications"}
        </Button>

        {status === "loading" && (
          <Button
            variant="outlined"
            onClick={openBrowserViewer}
            startIcon={<ComputerIcon />}
            sx={{
              borderColor: "#d1d5db",
              color: "#000000",
              "&:hover": {
                borderColor: "#000000",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            View Browser Automation
          </Button>
        )}
      </Box>

      {/* Results Section */}
      {results.length > 0 && (
        <Card sx={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#000000", letterSpacing: "-0.025em", mb: 2 }}>
              <WorkIcon sx={{ mr: 1, color: "#000000" }} />
              Application Results
            </Typography>

            <Grid container spacing={2}>
              {results.map((result, index) => (
                <Grid item xs={12} key={index}>
                  <Accordion sx={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#000000" }} />}>
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <Box sx={{ color: getStatusColor(result.status), mr: 2 }}>
                          {getStatusIcon(result.status)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ color: "#000000", fontWeight: 600 }}>
                            {result.company_name} - {result.job_title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            {result.url}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusText(result.status)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(result.status),
                            color: "#ffffff",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
                          <strong>Applied:</strong> {new Date(result.applied_at).toLocaleString()}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
                          <strong>Questions Answered:</strong> {result.questions_answered}
                        </Typography>

                        {result.error_message && (
                          <Alert severity="error" sx={{ mb: 2, backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                            <AlertTitle>Error</AlertTitle>
                            {result.error_message}
                          </Alert>
                        )}

                        {result.missing_fields && result.missing_fields.length > 0 && (
                          <Alert severity="warning" sx={{ mb: 2, backgroundColor: "#fffbeb", border: "1px solid #fed7aa" }}>
                            <AlertTitle>Missing Fields</AlertTitle>
                            The following fields could not be filled: {result.missing_fields.join(", ")}
                          </Alert>
                        )}

                        {result.questions_and_answers && result.questions_and_answers.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: "#000000", mb: 1 }}>
                              Questions and Answers:
                            </Typography>
                            <List dense>
                              {result.questions_and_answers.map((qa, qaIndex) => (
                                <ListItem key={qaIndex} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ color: "#000000", fontWeight: 500 }}>
                                        {qa.question}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                        {qa.answer}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Browser Automation Viewer Dialog */}
      <Dialog
        open={browserViewerOpen}
        onClose={closeBrowserViewer}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: "#000000", letterSpacing: "-0.025em" }}>
          <ComputerIcon sx={{ mr: 1, color: "#000000" }} />
          Browser Automation Viewer
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
              This shows the real-time browser automation process. The browser window should be visible on your screen.
            </Typography>
            
            {currentApplication && (
              <Alert severity="info" sx={{ mb: 2, backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <AlertTitle>Current Application</AlertTitle>
                Processing: {currentApplication.url}
                <br />
                Progress: {currentApplication.index}/{currentApplication.total}
              </Alert>
            )}
          </Box>

          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            <Typography variant="subtitle2" sx={{ color: "#000000", mb: 1 }}>
              Browser Logs:
            </Typography>
            {browserLogs.map((log, index) => (
              <Box
                key={index}
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: log.type === 'error' ? '#fef2f2' : 
                                 log.type === 'success' ? '#f0fdf4' : '#f8fafc',
                  border: log.type === 'error' ? '1px solid #fecaca' :
                         log.type === 'success' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                }}
              >
                <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Typography>
                <Typography variant="body2" sx={{ color: "#000000" }}>
                  {log.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBrowserViewer} sx={{ color: "#000000" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default JobApplicationForm;
