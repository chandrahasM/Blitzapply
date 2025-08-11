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
  Divider,
  Stack,
  InputAdornment,
  FormHelperText,
  Input,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { saveUserProfile, saveUserCustomFields } from "../services/apiService";

function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    user_id: 1,
    full_name: "",
    email: "",
    phone: "",
    resume_file: null,
    resume_filename: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  const [customFields, setCustomFields] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: 'success', title: '', message: '' });

  // Load profile and custom fields on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const savedProfile = localStorage.getItem("profile");
        const savedCustomFields = localStorage.getItem("customFields");

        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile({
            ...parsedProfile,
            user_id: 1,
            // Handle legacy resume_url field
            resume_file: parsedProfile.resume_file || null,
            resume_filename: parsedProfile.resume_filename || "",
            resume_url: parsedProfile.resume_url || "",
          });
        }

        if (savedCustomFields) {
          const fields = JSON.parse(savedCustomFields).map((field, index) => ({
            id: index + 1,
            user_id: 1,
            field_name: field.field_name,
            field_value: field.field_value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          setCustomFields(fields);
        } else {
          setCustomFields([
            {
              id: 1,
              user_id: 1,
              field_name: "Availability Date",
              field_value: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              user_id: 1,
              field_name: "Salary Expectations",
              field_value: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        setAlert({
          show: true,
          type: 'error',
          title: 'Error loading profile',
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          show: true,
          type: 'error',
          title: 'File too large',
          message: 'Please select a resume file smaller than 5MB.',
        });
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setAlert({
          show: true,
          type: 'error',
          title: 'Invalid file type',
          message: 'Please select a PDF or Word document (.pdf, .doc, .docx).',
        });
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setProfile(prev => ({
          ...prev,
          resume_file: base64String,
          resume_filename: file.name,
        }));
      };
      reader.readAsDataURL(file);

      setAlert({
        show: true,
        type: 'success',
        title: 'Resume uploaded!',
        message: `${file.name} has been uploaded successfully.`,
      });

      // Auto-hide success alert after 3 seconds
      setTimeout(() => {
        setAlert({ show: false, type: 'success', title: '', message: '' });
      }, 3000);
    }
  };

  const removeResume = () => {
    setProfile(prev => ({
      ...prev,
      resume_file: null,
      resume_filename: "",
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updatedFields = [...customFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
      updated_at: new Date().toISOString(),
    };
    setCustomFields(updatedFields);
  };

  const addCustomField = () => {
    const newField = {
      id: customFields.length + 1,
      user_id: 1,
      field_name: "",
      field_value: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCustomFields([...customFields, newField]);
  };

  const removeCustomField = (index) => {
    const updatedFields = customFields.filter((_, i) => i !== index);
    setCustomFields(updatedFields);
  };

  const saveProfile = async () => {
    if (!profile.full_name || !profile.email) {
      setAlert({
        show: true,
        type: 'warning',
        title: 'Missing information',
        message: 'Please provide at least your name and email.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save profile to backend
      await saveUserProfile(profileData);
      
      // Save custom fields to backend
      await saveUserCustomFields(customFields);

      // Also save to localStorage for offline access
      localStorage.setItem("profile", JSON.stringify(profileData));
      localStorage.setItem("customFields", JSON.stringify(customFields));

      setAlert({
        show: true,
        type: 'success',
        title: 'Profile saved!',
        message: 'Your information has been saved successfully to the backend.',
      });

      // Auto-hide success alert after 3 seconds
      setTimeout(() => {
        setAlert({ show: false, type: 'success', title: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setAlert({
        show: true,
        type: 'error',
        title: 'Error saving profile',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile.full_name) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {alert.show && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlert({ show: false, type: 'success', title: '', message: '' })}
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.message}
        </Alert>
      )}

      <Stack spacing={4}>
        {/* Personal Information Card */}
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <PersonIcon sx={{ mr: 2, color: '#000000' }} />
              <Typography variant="h5" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                Personal Information
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={profile.full_name || ""}
                  onChange={handleProfileChange}
                  placeholder="John Doe"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email || ""}
                  onChange={handleProfileChange}
                  placeholder="john.doe@example.com"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#000000' }} />
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
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleProfileChange}
                  placeholder="123-456-7890"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#000000' }} />
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
            </Grid>
          </CardContent>
        </Card>

        {/* Professional Links Card */}
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <LinkIcon sx={{ mr: 2, color: '#000000' }} />
              <Typography variant="h5" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                Professional Links
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1 }}>
                    Resume File
                  </Typography>
                  {profile.resume_file ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #d1d5db', borderRadius: 1, backgroundColor: '#f9fafb' }}>
                      <DescriptionIcon sx={{ color: '#000000' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ color: '#000000', fontWeight: 500 }}>
                          {profile.resume_filename}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Resume uploaded successfully
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={removeResume}
                        sx={{ color: '#dc2626', borderColor: '#dc2626' }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <input
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        id="resume-upload"
                        type="file"
                        onChange={handleResumeUpload}
                      />
                      <label htmlFor="resume-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          sx={{
                            borderColor: '#d1d5db',
                            color: '#000000',
                            '&:hover': {
                              borderColor: '#000000',
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            },
                          }}
                        >
                          Upload Resume
                        </Button>
                      </label>
                      <FormHelperText sx={{ color: '#6b7280', mt: 1 }}>
                        Upload your resume (PDF, DOC, or DOCX). Max size: 5MB.
                      </FormHelperText>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  name="linkedin_url"
                  value={profile.linkedin_url || ""}
                  onChange={handleProfileChange}
                  placeholder="https://linkedin.com/in/johndoe"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedInIcon sx={{ color: '#000000' }} />
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
                  fullWidth
                  label="GitHub URL"
                  name="github_url"
                  value={profile.github_url || ""}
                  onChange={handleProfileChange}
                  placeholder="https://github.com/johndoe"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHubIcon sx={{ color: '#000000' }} />
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
                  fullWidth
                  label="Portfolio URL"
                  name="portfolio_url"
                  value={profile.portfolio_url || ""}
                  onChange={handleProfileChange}
                  placeholder="https://johndoe.portfolio.com"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon sx={{ color: '#000000' }} />
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
            </Grid>
          </CardContent>
        </Card>

        {/* Custom Fields Card */}
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box display="flex" alignItems="center">
                <AddIcon sx={{ mr: 2, color: '#000000' }} />
                <Typography variant="h5" fontWeight={600} color="#000000" letterSpacing="-0.025em">
                  Custom Fields
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addCustomField}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb',
                  },
                }}
              >
                Add Field
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={3}>
              Add any additional information that may be required for job applications.
            </Typography>

            <Stack spacing={2}>
              {customFields.map((field, index) => (
                <Card
                  key={field.id}
                  elevation={0}
                  sx={{
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      borderColor: '#000000',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Field Name"
                          value={field.field_name}
                          onChange={(e) =>
                            handleCustomFieldChange(index, "field_name", e.target.value)
                          }
                          placeholder="e.g. Availability Date"
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#ffffff',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Field Value"
                          value={field.field_value}
                          onChange={(e) =>
                            handleCustomFieldChange(index, "field_value", e.target.value)
                          }
                          placeholder="e.g. 2025-04-01"
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#ffffff',
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <IconButton
                          onClick={() => removeCustomField(index)}
                          sx={{
                            color: '#dc2626',
                            '&:hover': {
                              backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={saveProfile}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: '#000000',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              '&:hover': {
                background: '#111827',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default ProfileForm;
