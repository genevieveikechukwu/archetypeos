import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCourses, getCourse, enrollInCourse } from '../services/api';
import { BookOpen, Clock, Award, CheckCircle, PlayCircle, AlertCircle, FileText, Video, Link2, Timer, Trophy, ArrowRight, CheckSquare } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CandidateComplete() {
  const { user } = useAuth();
  const [view, setView] = useState('dashboard');
  const [assignedCourse, setAssignedCourse] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [completedContent, setCompletedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testAttempts, setTestAttempts] = useState([]);
  const [activeTest, setActiveTest] = useState(null);

  useEffect(() => {
    fetchAssignedCourse();
  }, []);

  const fetchAssignedCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getCourses();
      const courses = response.data.courses || [];
      
      if (courses.length > 0) {
        const courseDetails = await getCourse(courses[0].id);
        setAssignedCourse(courseDetails.data);
        
        const testsRes = await axios.get(`${API_URL}/tests`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { tests: [] } }));
        
        const courseTests = testsRes.data.tests?.filter(t => t.course_id === courses[0].id) || [];
        setTestAttempts(courseTests);
      }
    } catch (error) {
      console.error('Failed to fetch assigned course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = async () => {
    if (!assignedCourse) return;
    
    try {
      await enrollInCourse(assignedCourse.course.id);
      alert('Course started! You can now access all materials.');
      fetchAssignedCourse();
      setView('materials');
    } catch (error) {
      console.error('Failed to start course:', error);
      alert(error.response?.data?.error || 'Failed to start course');
    }
  };

  const handleMarkComplete = (contentId) => {
    if (!completedContent.includes(contentId)) {
      setCompletedContent([...completedContent, contentId]);
      
      const newProgress = Math.round((completedContent.length + 1) / assignedCourse.content.length * 100);
      updateProgress(newProgress);
    }
  };

  const updateProgress = async (percentage) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/courses/${assignedCourse.course.id}/progress`,
        { progress_percentage: percentage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (!assignedCourse) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.full_name}! 👋</h1>
          <p className="text-blue-100 text-lg">Candidate Assessment Portal</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Assessment Course Assigned Yet</h2>
          <p className="text-gray-600 mb-2 max-w-md mx-auto">
            Please wait while the hiring team assigns your assessment course.
          </p>
          <p className="text-sm text-gray-500">
            You will receive a notification once your course is ready.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return <CandidateDashboard 
      user={user} 
      assignedCourse={assignedCourse} 
      onStartCourse={handleStartCourse}
      onViewMaterials={() => setView('materials')}
      onViewTests={() => setView('tests')}
      completedCount={completedContent.length}
    />;
  }

  if (view === 'materials') {
    return <CourseMaterials 
      course={assignedCourse}
      completedContent={completedContent}
      onMarkComplete={handleMarkComplete}
      onBack={() => setView('dashboard')}
      selectedContent={selectedContent}
      onSelectContent={setSelectedContent}
    />;
  }

  if (view === 'tests') {
    return <TestView 
      course={assignedCourse}
      tests={assignedCourse.tests || []}
      onBack={() => setView('dashboard')}
      activeTest={activeTest}
      onStartTest={setActiveTest}
    />;
  }

  return null;
}

function CandidateDashboard({ user, assignedCourse, onStartCourse, onViewMaterials, onViewTests, completedCount }) {
  const totalMaterials = assignedCourse.content?.length || 0;
  const progress = assignedCourse.enrollment?.progress_percentage || 0;
  const hasEnrolled = !!assignedCourse.enrollment;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.full_name}! 👋</h1>
        <p className="text-blue-100 text-lg mb-4">Candidate Assessment Portal</p>
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <p className="text-sm font-medium">Status: Pre-Interview Assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">1</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Assessment Course</p>
          <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{progress}%</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Progress</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{assignedCourse.course?.estimated_hours || '~'}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Estimated Hours</p>
          <p className="text-xs text-gray-500 mt-1">Total duration</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-3">{assignedCourse.course.title}</h2>
          <p className="text-indigo-100 text-lg mb-4">{assignedCourse.course.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium capitalize">
              {assignedCourse.course.difficulty}
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              <FileText className="h-4 w-4 inline mr-1" />
              {totalMaterials} Materials
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              <Trophy className="h-4 w-4 inline mr-1" />
              {assignedCourse.tests?.length || 0} Assessments
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-2">Important Information</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Complete all course materials at your own pace</li>
                  <li>Pass the assessment to demonstrate your learning ability</li>
                  <li>Your performance will be reviewed for next steps</li>
                  <li>All progress is automatically tracked and timestamped</li>
                </ul>
              </div>
            </div>
          </div>

          {!hasEnrolled ? (
            <div className="text-center py-8">
              <button
                onClick={onStartCourse}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlayCircle className="h-6 w-6 mr-3" />
                Start Assessment Course
              </button>
              <p className="text-sm text-gray-500 mt-4">Click to begin your learning journey</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={onViewMaterials}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all border-2 border-blue-200 group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Study Materials</p>
                    <p className="text-sm text-gray-600">{completedCount}/{totalMaterials} completed</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onViewTests}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all border-2 border-purple-200 group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Take Assessment</p>
                    <p className="text-sm text-gray-600">{assignedCourse.tests?.length || 0} available</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseMaterials({ course, completedContent, onMarkComplete, onBack, selectedContent, onSelectContent }) {
  const materials = course.content || [];
  const totalMaterials = materials.length;
  const completedCount = completedContent.length;
  const progressPercent = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

  const getIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'link': return <Link2 className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Dashboard
        </button>
        <div className="text-right">
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-2xl font-bold text-blue-600">{progressPercent}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{course.course.title} - Materials</h2>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <p className="text-sm text-gray-600">{completedCount} of {totalMaterials} materials completed</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {materials.map((material, index) => {
          const isCompleted = completedContent.includes(material.id);
          const isSelected = selectedContent?.id === material.id;
          
          return (
            <div
              key={material.id}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 overflow-hidden ${
                isCompleted ? 'border-green-500' : isSelected ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold mr-4 ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{material.title}</h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                          {getIcon(material.content_type)}
                          <span className="ml-2 capitalize">{material.content_type}</span>
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <CheckSquare className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                      
                      {material.content_url && (
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={material.content_url.startsWith('/uploads') 
                              ? `http://localhost:3000${material.content_url}` 
                              : material.content_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Open Material
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </a>
                          
                          {!isCompleted && (
                            <button
                              onClick={() => onMarkComplete(material.id)}
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Complete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {materials.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No materials available yet</p>
        </div>
      )}
    </div>
  );
}

function TestView({ course, tests, onBack, activeTest, onStartTest }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Tests</h2>
        <p className="text-gray-600">Complete these assessments to demonstrate your knowledge</p>
      </div>

      {tests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{test.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Trophy className="h-4 w-4 mr-1" />
                    Passing: {test.passing_score}%
                  </span>
                  {test.time_limit_minutes && (
                    <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <Timer className="h-4 w-4 mr-1" />
                      {test.time_limit_minutes} minutes
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full capitalize">
                    {test.test_type}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl">
                  <PlayCircle className="h-6 w-6 inline mr-2" />
                  Start Test
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Your attempt will be timestamped and recorded
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No assessments available yet</p>
        </div>
      )}
    </div>
  );
}