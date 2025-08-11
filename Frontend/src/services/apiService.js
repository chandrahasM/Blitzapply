const API_URL = process.env.REACT_APP_API_URL || "https://blitzapply-backend2.onrender.com";

/**
 * Get current user information (mock for now)
 * @returns {Promise<Object>} - User data
 */
export const getCurrentUser = async () => {
  // Mock user for now - in production this would come from auth
  return {
    id: 1,
    email: "user@example.com",
    name: "Test User"
  };
};

/**
 * Save user profile
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<Object>} - Updated profile data
 */
export const saveUserProfile = async (profileData) => {
  try {
    const user = await getCurrentUser();
    const profileWithUserId = {
      ...profileData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await fetch(`${API_URL}/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileWithUserId),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

/**
 * Get user profile information
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
  try {
    const user = await getCurrentUser();
    const response = await fetch(`${API_URL}/profile/${user.id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Profile not found
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Get user custom fields
 * @returns {Promise<Array>} - List of custom fields
 */
export const getUserCustomFields = async () => {
  try {
    const user = await getCurrentUser();
    const response = await fetch(`${API_URL}/custom-fields/${user.id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No custom fields found
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.custom_fields || [];
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    throw error;
  }
};

/**
 * Save user custom fields
 * @param {Array} customFields - Custom fields to save
 * @returns {Promise<Array>} - Updated custom fields
 */
export const saveUserCustomFields = async (customFields) => {
  try {
    const user = await getCurrentUser();
    const fieldsWithIds = customFields.map((field, index) => ({
      ...field,
      id: field.id || index + 1,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const response = await fetch(`${API_URL}/custom-fields/${user.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fieldsWithIds),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving custom fields:", error);
    throw error;
  }
};

/**
 * Submit a job application
 * @param {string} url - The job posting URL
 * @returns {Promise<Object>} - Result of the application submission
 */
export const submitJobApplication = async (url) => {
  try {
    const user = await getCurrentUser();
    const response = await fetch(`${API_URL}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_url: url,
        user_id: user.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting job application:", error);
    throw error;
  }
};

/**
 * Submit multiple job applications
 * @param {Array<string>} urls - Array of job posting URLs
 * @returns {Promise<Object>} - Results of the application submissions
 */
export const submitBatchJobApplications = async (urls) => {
  try {
    const user = await getCurrentUser();
    const requests = urls.map(url => ({
      job_url: url,
      user_id: user.id,
    }));

    const response = await fetch(`${API_URL}/apply-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requests),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting batch job applications:", error);
    throw error;
  }
};

/**
 * Get application history
 * @returns {Promise<Object>} - Application history data
 */
export const getApplicationHistory = async () => {
  try {
    const user = await getCurrentUser();
    const response = await fetch(`${API_URL}/history/${user.id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching application history:", error);
    throw error;
  }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} - User statistics
 */
export const getUserStats = async () => {
  try {
    const user = await getCurrentUser();
    const response = await fetch(`${API_URL}/stats/${user.id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

/**
 * Delete an application from history
 * @param {number} applicationId - Application ID to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteApplication = async (applicationId) => {
  try {
    const response = await fetch(`${API_URL}/history/${applicationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
};

/**
 * Test field mapping system
 * @returns {Promise<Object>} - Field mapping test results
 */
export const testFieldMapping = async () => {
  try {
    const response = await fetch(`${API_URL}/test-field-mapping`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error testing field mapping:", error);
    throw error;
  }
};

export default {
  getCurrentUser,
  saveUserProfile,
  getUserProfile,
  getUserCustomFields,
  saveUserCustomFields,
  submitJobApplication,
  submitBatchJobApplications,
  getApplicationHistory,
  getUserStats,
  deleteApplication,
  testFieldMapping,
};
