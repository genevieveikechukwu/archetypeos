import { useState, useEffect } from 'react';
import { getCourses, enrollInCourse, getMyEnrollments, getCourse } from '../services/api';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        getCourses(),
        getMyEnrollments(),
      ]);
      setCourses(coursesRes.data.courses);
      setEnrollments(enrollmentsRes.data.enrollments);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      await fetchData();
      alert('Successfully enrolled!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to enroll');
    }
  };

  const viewCourse = async (courseId) => {
    try {
      const res = await getCourse(courseId);
      setSelectedCourse(res.data);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.course_id === courseId);
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'enrolled') return isEnrolled(course.id);
    if (filter === 'available') return !isEnrolled(course.id);
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="mt-2 text-blue-100">Explore and enroll in courses to grow your skills</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            All Courses ({courses.length})
          </button>
          <button onClick={() => setFilter('enrolled')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'enrolled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            My Courses ({enrollments.length})
          </button>
          <button onClick={() => setFilter('available')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Available ({courses.length - enrollments.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const enrollment = enrollments.find(e => e.course_id === course.id);
          const enrolled = !!enrollment;

          return (
            <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className={`h-2 ${course.difficulty === 'beginner' ? 'bg-green-500' : course.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {course.difficulty}
                      </span>
                      {course.archetype && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {course.archetype}
                        </span>
                      )}
                    </div>
                  </div>
                  {enrolled && <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                  {course.estimated_hours && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.estimated_hours}h
                    </div>
                  )}
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.content_count || 0} lessons
                  </div>
                </div>

                {enrolled && enrollment && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${enrollment.progress_percentage}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button onClick={() => viewCourse(course.id)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    View Details
                  </button>
                  {!enrolled && (
                    <button onClick={() => handleEnroll(course.id)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Enroll
                    </button>
                  )}
                  {enrolled && (
                    <button onClick={() => viewCourse(course.id)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No courses found</p>
        </div>
      )}
    </div>
  );
}

function CourseDetail({ course, onBack }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Courses
      </button>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className={`h-3 ${course.course.difficulty === 'beginner' ? 'bg-green-500' : course.course.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.course.title}</h1>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  course.course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.course.difficulty}
                </span>
                {course.course.archetype && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                    {course.course.archetype}
                  </span>
                )}
                <span className="text-gray-500">v{course.course.version}</span>
              </div>
            </div>
            {course.enrollment && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Your Progress</p>
                <p className="text-3xl font-bold text-blue-600">{course.enrollment.progress_percentage}%</p>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About this course</h2>
            <p className="text-gray-600">{course.course.description}</p>
          </div>

          {course.course.estimated_hours && (
            <div className="flex items-center text-gray-600 mb-8">
              <Clock className="h-5 w-5 mr-2" />
              <span>Estimated time: {course.course.estimated_hours} hours</span>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Course Materials ({course.content?.length || 0})
            </h2>
            
            {course.content && course.content.length > 0 ? (
              <div className="space-y-3">
                {course.content.map((item, index) => (
                  <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-white rounded">
                          {item.content_type}
                        </span>
                        {item.content_url && (
                          <span className="text-xs text-blue-600">
                            {item.content_url.startsWith('/uploads') ? 'Uploaded File' : 'External Link'}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.content_url && (
                      <a 
                        href={item.content_url.startsWith('/uploads') 
                          ? `http://localhost:3000${item.content_url}` 
                          : item.content_url
                        } 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No course materials uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">Contact your administrator to add materials</p>
              </div>
            )}
          </div>

          {course.tests && course.tests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Assessments</h2>
              <div className="space-y-3">
                {course.tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <p className="font-medium text-gray-900">{test.title}</p>
                      <p className="text-sm text-gray-600">
                        {test.test_type} • Passing: {test.passing_score}%
                        {test.time_limit_minutes && ` • ${test.time_limit_minutes} min`}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Take Test
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}