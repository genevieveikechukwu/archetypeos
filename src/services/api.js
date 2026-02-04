import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout for production
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const register = (userData) => api.post('/api/auth/register', userData);
export const getProfile = () => api.get('/api/auth/me');
export const changePassword = (currentPassword, newPassword) => 
  api.post('/api/auth/change-password', { current_password: currentPassword, new_password: newPassword });

// ==================== LEARNING ====================
export const clockIn = () => api.post('/api/learning/clock-in');
export const clockOut = (reflection) => api.post('/api/learning/clock-out', { reflection_text: reflection });
export const getTodaySessions = () => api.get('/api/learning/today');
export const getLearningHistory = (params) => api.get('/api/learning/history', { params });
export const getStreak = () => api.get('/api/learning/streak');
export const getWeeklyReport = () => api.get('/api/learning/weekly-report');
export const getTeamSummary = () => api.get('/api/learning/team-summary');

// ==================== COURSES ====================
export const getCourses = (params) => api.get('/api/courses', { params });
export const getCourse = (id) => api.get(`/api/courses/${id}`);
export const createCourse = (data) => api.post('/api/courses', data);
export const updateCourse = (id, data) => api.put(`/api/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/api/courses/${id}`);
export const enrollInCourse = (id) => api.post(`/api/courses/${id}/enroll`);
export const getMyEnrollments = () => api.get('/api/courses/my/enrollments');
export const updateCourseProgress = (id, progress) => 
  api.put(`/api/courses/${id}/progress`, { progress_percentage: progress });

// ==================== DASHBOARDS ====================
export const getLearnerDashboard = () => api.get('/api/dashboard/learner');
export const getSupervisorDashboard = () => api.get('/api/dashboard/supervisor');
export const getAdminDashboard = () => api.get('/api/dashboard/admin');
export const exportData = (type) => api.get(`/api/dashboard/export/${type}`);

// ==================== MESSAGING & KUDOS ====================
export const sendMessage = (data) => api.post('/api/mentorship/messages', data);
export const getMessages = (params) => api.get('/api/mentorship/messages', { params });
export const getUnreadCount = () => api.get('/api/mentorship/messages/unread/count');
export const sendKudos = (data) => api.post('/api/mentorship/kudos', data);
export const getKudosReceived = () => api.get('/api/mentorship/kudos/received');
export const getKudosGiven = () => api.get('/api/mentorship/kudos/given');
export const getConversations = () => api.get('/api/mentorship/conversations');
// ==================== JOURNAL ====================
export const saveJournal = (data) => api.post('/api/mentorship/journal', data);
export const getJournals = (params) => api.get('/api/mentorship/journal', { params });

// ==================== SKILLS ====================
export const getSkills = () => api.get('/api/skills');
export const createSkill = (data) => api.post('/api/skills', data);
export const linkSkillToCourse = (data) => api.post('/api/skills/course-link', data);
export const calculateUserSkills = (userId) => api.post(`/api/skills/calculate/${userId}`);
export const getUserSkills = (userId) => api.get(`/api/skills/user/${userId}`);
export const searchUsersBySkill = (params) => api.get('/api/skills/search', { params });
export const getSkillGraph = (userId) => api.get(`/api/skills/graph/${userId}`);

// Assignments
export const submitAssignment = (formData) => api.post('/api/assignments/submit', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMyAssignments = () => api.get('/api/assignments/my-assignments');
export const getAssignmentsToReview = (status) => api.get('/api/assignments/to-review/all', { params: { status } });
export const reviewAssignment = (assignmentId, data) => api.put(`/api/assignments/${assignmentId}/review`, data);
export const deleteAssignment = (assignmentId) => api.delete(`/api/assignments/${assignmentId}`);

// ==================== TESTS ====================
export const createTest = (data) => api.post('/api/tests', data);
export const getTest = (id) => api.get(`/api/tests/${id}`);
export const startTestAttempt = (testId) => api.post(`/api/tests/${testId}/start`);
export const submitTestAnswers = (attemptId, answers) => 
  api.post(`/api/tests/attempts/${attemptId}/submit`, { answers });
export const gradeTest = (attemptId, data) => api.post(`/api/tests/attempts/${attemptId}/grade`, data);
export const getPendingTests = () => api.get('/api/tests/pending/grading');

// ==================== ADMIN - USER MANAGEMENT ====================
export const getUsers = () => api.get('/admin/users');
export const createUser = (data) => api.post('/admin/users', data);
export const updateUser = (userId, data) => api.put(`/admin/users/${userId}`, data);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const changeUsername = (userId, newEmail) => 
  api.put(`/admin/users/${userId}/username`, { new_email: newEmail });
export const changeUserPassword = (userId, newPassword) => 
  api.put(`/admin/users/${userId}/password`, { new_password: newPassword });
export const toggleUserStatus = (userId) => api.put(`/admin/users/${userId}/toggle-status`);
export const getSupervisors = () => api.get('/admin/supervisors');

// ==================== ADMIN - COURSE MANAGEMENT ====================
export const uploadCourseMaterial = (courseId, formData) => 
  api.post(`/admin/courses/${courseId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // 60 seconds for file uploads
  });
export const addCourseContent = (courseId, data) => api.post(`/admin/courses/${courseId}/content`, data);
export const updateCourseContent = (contentId, data) => api.put(`/admin/content/${contentId}`, data);
export const deleteCourseContent = (contentId) => api.delete(`/admin/content/${contentId}`);

// ==================== SUPERVISOR ====================
export const getMyLearners = () => api.get('/supervisor/my-learners');
export const getLearnerTimeAnalytics = (learnerId, period) => 
  api.get(`/supervisor/learners/${learnerId}/time-analytics`, { params: { period } });
export const getLearnerCompliance = (learnerId) => 
  api.get(`/supervisor/learners/${learnerId}/compliance`);
export const flagLearner = (learnerId, data) => 
  api.post(`/supervisor/learners/${learnerId}/flag`, data);

// ==================== FEEDBACK ====================
export const sendFeedback = (data) => api.post('/feedback/send', data);
export const getAllFeedback = () => api.get('/feedback/all');
export const getNotifications = () => api.get('/feedback/notifications');
export const markNotificationRead = (notificationId) => 
  api.put(`/feedback/notifications/${notificationId}/read`);

// ==================== UTILITY ====================
export const healthCheck = () => api.get('/health', { baseURL: API_URL.replace('/api', '') });

export default api;