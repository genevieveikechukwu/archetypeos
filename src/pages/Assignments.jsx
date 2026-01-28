import { useState, useEffect } from 'react';
import { getMyEnrollments } from '../services/api';
import { Upload, FileText, Link2, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';
import { getMyEnrollments, submitAssignment, getMyAssignments } from '../services/api';

// In fetchData:
const [enrollmentsRes, assignmentsRes] = await Promise.all([
  getMyEnrollments(),
  getMyAssignments()
]);

// In handleSubmit:
await submitAssignment(formData);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Assignments() {
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    submission_type: 'link',
    submission_url: '',
    file: null
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [enrollmentsRes, assignmentsRes] = await Promise.all([
        getMyEnrollments(),
        axios.get(`${API_URL}/learning/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { assignments: [] } }))
      ]);
      
      setEnrollments(enrollmentsRes.data.enrollments || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !assignmentForm.title.trim()) {
      alert('Please select a course and enter a title');
      return;
    }

    if (assignmentForm.submission_type === 'link' && !assignmentForm.submission_url.trim()) {
      alert('Please provide a submission URL');
      return;
    }

    if (assignmentForm.submission_type === 'file' && !assignmentForm.file) {
      alert('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('course_id', selectedCourse);
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      formData.append('submission_type', assignmentForm.submission_type);
      
      if (assignmentForm.submission_type === 'link') {
        formData.append('submission_url', assignmentForm.submission_url);
      } else if (assignmentForm.file) {
        formData.append('file', assignmentForm.file);
      }

      await axios.post(`${API_URL}/learning/submit-assignment`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Assignment submitted successfully!');
      setAssignmentForm({
        title: '',
        description: '',
        submission_type: 'link',
        submission_url: '',
        file: null
      });
      setSelectedCourse('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const reviewedCount = assignments.filter(a => a.status === 'reviewed').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Assignments & Submissions</h1>
        <p className="mt-2 text-indigo-100">Upload your work for supervisor review</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Total Submitted</p>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Pending Review</p>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Reviewed</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{reviewedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit New Assignment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Choose a course...</option>
                {enrollments.map((enrollment) => (
                  <option key={enrollment.course_id} value={enrollment.course_id}>
                    {enrollment.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                placeholder="e.g., Week 3 Project, Final Assignment"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description / Notes
              </label>
              <textarea
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                placeholder="Add any notes or context about your submission..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Type
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setAssignmentForm({ ...assignmentForm, submission_type: 'link', file: null })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    assignmentForm.submission_type === 'link'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Link2 className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Link/URL</span>
                </button>
                <button
                  onClick={() => setAssignmentForm({ ...assignmentForm, submission_type: 'file', submission_url: '' })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    assignmentForm.submission_type === 'file'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Upload className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">File Upload</span>
                </button>
              </div>
            </div>

            {assignmentForm.submission_type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission URL
                </label>
                <input
                  type="url"
                  value={assignmentForm.submission_url}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, submission_url: e.target.value })}
                  placeholder="https://github.com/username/repo or https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {assignmentForm.submission_type === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <input
                    type="file"
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files[0] })}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  {assignmentForm.file && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {assignmentForm.file.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedCourse || !assignmentForm.title.trim()}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submission History</h2>
          
          {assignments.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">{assignment.course_title}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'reviewed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {assignment.status === 'reviewed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Reviewed
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 inline mr-1" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  )}
                  
                  {assignment.submission_url && (
                    <a
                      href={assignment.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                    >
                      <Link2 className="h-4 w-4 mr-1" />
                      View Submission
                    </a>
                  )}
                  
                  {assignment.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">Supervisor Feedback:</p>
                      <p className="text-sm text-blue-800">{assignment.feedback}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted {new Date(assignment.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assignments submitted yet</p>
              <p className="text-sm text-gray-400 mt-2">Submit your first assignment to get started</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Submission Guidelines</p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>For code projects: Submit GitHub/GitLab repository links</li>
              <li>For documents: Upload PDF, DOCX, or provide Google Docs link</li>
              <li>Include clear descriptions of what you've completed</li>
              <li>Your supervisor will review and provide feedback within 3-5 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}