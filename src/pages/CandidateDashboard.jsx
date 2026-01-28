import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCourses, getCourse, enrollInCourse } from '../services/api';
import { BookOpen, Clock, Award, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [assignedCourse, setAssignedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedCourse();
  }, []);

  const fetchAssignedCourse = async () => {
    try {
      const response = await getCourses();
      const courses = response.data.courses || [];
      
      if (courses.length > 0) {
        const courseDetails = await getCourse(courses[0].id);
        setAssignedCourse(courseDetails.data);
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
      alert('Course started! You can now access the materials.');
      fetchAssignedCourse();
    } catch (error) {
      console.error('Failed to start course:', error);
      alert(error.response?.data?.error || 'Failed to start course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.full_name}! 👋</h1>
        <p className="text-blue-100 text-lg">Candidate Assessment Portal</p>
        <div className="mt-4 inline-block px-4 py-2 bg-white/20 rounded-full">
          <p className="text-sm font-medium">Status: Pre-Interview Assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Assessment Course</p>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{assignedCourse ? '1' : '0'}</p>
          <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Progress</p>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {assignedCourse?.enrollment?.progress_percentage || 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Course completion</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Time to Complete</p>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {assignedCourse?.course?.estimated_hours || '~'} hrs
          </p>
          <p className="text-xs text-gray-500 mt-1">Estimated duration</p>
        </div>
      </div>

      {assignedCourse ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{assignedCourse.course.title}</h2>
            <p className="text-indigo-100">{assignedCourse.course.description}</p>
            <div className="flex items-center space-x-3 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20`}>
                {assignedCourse.course.difficulty}
              </span>
              {assignedCourse.course.estimated_hours && (
                <span className="text-sm text-indigo-100">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {assignedCourse.course.estimated_hours} hours
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">About This Assessment</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Important Information</p>
                  <p className="text-sm text-blue-800 mt-1">
                    Complete this course and pass the assessment to demonstrate your learning ability. 
                    Your performance will be reviewed for the next steps in the hiring process.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-3">Course Materials</h3>
            
            {assignedCourse.content && assignedCourse.content.length > 0 ? (
              <div className="space-y-2 mb-6">
                {assignedCourse.content.map((item, index) => (
                  <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 capitalize">{item.content_type}</p>
                    </div>
                    {item.content_url && (
                      <a 
                        href={item.content_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No materials available yet</p>
            )}

            {assignedCourse.tests && assignedCourse.tests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Assessments</h3>
                <div className="space-y-2">
                  {assignedCourse.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{test.title}</p>
                          <p className="text-sm text-gray-600">
                            Passing score: {test.passing_score}% 
                            {test.time_limit_minutes && ` • ${test.time_limit_minutes} minutes`}
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        Start Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!assignedCourse.enrollment && (
              <div className="mt-6">
                <button
                  onClick={handleStartCourse}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-lg shadow-lg"
                >
                  <PlayCircle className="h-6 w-6 mr-2" />
                  Start Assessment Course
                </button>
              </div>
            )}

            {assignedCourse.enrollment && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Progress</span>
                  <span className="text-sm text-gray-600">{assignedCourse.enrollment.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${assignedCourse.enrollment.progress_percentage}%` }}
                  ></div>
                </div>
                {assignedCourse.enrollment.progress_percentage === 100 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <p className="text-sm font-medium text-green-800">
                      Course completed! Your results are being reviewed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Assessment Course Assigned Yet</h2>
          <p className="text-gray-600 mb-4">
            Please wait while the hiring team assigns your assessment course.
          </p>
          <p className="text-sm text-gray-500">
            You will receive a notification once your course is ready.
          </p>
        </div>
      )}

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">What happens next?</p>
            <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
              <li>Complete the assigned course materials</li>
              <li>Take and pass the assessment test</li>
              <li>Your results will be reviewed by the hiring team</li>
              <li>You'll be notified about the next steps via email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}