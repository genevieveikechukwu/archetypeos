import { useState, useEffect } from 'react';
import CandidateComplete from './candidateComplete.jsx';
import { useAuth } from '../context/AuthContext';
import { getLearnerDashboard, getAdminDashboard, getSupervisorDashboard, getCourses, getCourse, enrollInCourse } from '../services/api';
import { BookOpen, Clock, Trophy, TrendingUp, Users, Award, Calendar, Target, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react';


export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      let response;
      if (user.role === 'admin') {
        response = await getAdminDashboard();
      } else if (user.role === 'supervisor') {
        response = await getSupervisorDashboard();
      } else if (user.role === 'candidate') {
        setLoading(false);
        return;
      } else {
        response = await getLearnerDashboard();
      }
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user.role === 'candidate') {
    return <CandidateComplete />;
  }

  if (user.role === 'learner') {
    return <LearnerDashboard data={data} user={user} />;
  }

  if (user.role === 'supervisor') {
    return <SupervisorDashboard data={data} user={user} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard data={data} user={user} />;
  }

  return null;
}

function CandidateDashboard() {
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
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20">
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
        </div>
      )}
    </div>
  );
}

function LearnerDashboard({ data, user }) {
  const stats = [
    { title: 'Enrolled Courses', value: data?.overview?.courses_enrolled || 0, icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Completed Courses', value: data?.overview?.courses_completed || 0, icon: Trophy, color: 'bg-green-500' },
    { title: 'Learning Hours', value: data?.learning_hours?.total_hours_this_month || '0', icon: Clock, color: 'bg-purple-500', suffix: 'hrs' },
    { title: 'Current Streak', value: data?.learning_hours?.current_streak || 0, icon: TrendingUp, color: 'bg-orange-500', suffix: 'days' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Welcome back, {user.full_name}! 👋</h1>
        <p className="mt-2 text-blue-100">{user.archetype ? `Archetype: ${user.archetype.charAt(0).toUpperCase() + user.archetype.slice(1)}` : 'Keep learning and growing!'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}{stat.suffix && <span className="text-lg text-gray-500 ml-1">{stat.suffix}</span>}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><Award className="h-6 w-6 mr-2 text-yellow-500" />Top Skills</h2>
          {data?.top_skills?.length > 0 ? (
            <div className="space-y-3">
              {data.top_skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{skill.name}</span>
                    <span className="text-gray-500">{skill.level.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(skill.level / 5) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Complete courses to build your skills!</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><Target className="h-6 w-6 mr-2 text-green-500" />Recent Test Scores</h2>
          {data?.recent_tests?.length > 0 ? (
            <div className="space-y-3">
              {data.recent_tests.map((test, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{test.title}</p>
                    <p className="text-xs text-gray-500">{new Date(test.graded_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${test.score >= 90 ? 'bg-green-100 text-green-800' : test.score >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {test.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No test scores yet!</p>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center"><Calendar className="h-6 w-6 mr-2 text-blue-500" />Learning Progress</h2>
          <span className="text-3xl font-bold text-blue-600">{data?.overview?.progress_percentage || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500" style={{ width: `${data?.overview?.progress_percentage || 0}%` }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{data?.overview?.courses_completed} of {data?.overview?.courses_enrolled} courses completed</p>
      </div>
    </div>
  );
}

function SupervisorDashboard({ data, user }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Team Overview</h1>
        <p className="mt-2 text-purple-100">Manage and monitor your team's progress</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data?.team_overview?.total_members || 0}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg"><Users className="h-6 w-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Compliance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data?.team_overview?.avg_compliance || 0}%</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg"><TrendingUp className="h-6 w-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Idle Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data?.team_overview?.idle_members || 0}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg"><Clock className="h-6 w-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Grades</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data?.team_overview?.pending_test_grades || 0}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg"><Award className="h-6 w-6 text-white" /></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Logged</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.team_members?.map((member, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{member.name}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.days_logged}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.total_hours} hrs</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.compliance_percentage >= 80 ? 'bg-green-100 text-green-800' : member.compliance_percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {member.compliance_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.is_idle ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Idle</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data, user }) {
  const stats = [
    { title: 'Total Users', value: data?.users?.total || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Learners', value: data?.users?.learners || 0, icon: BookOpen, color: 'bg-green-500' },
    { title: 'Total Courses', value: data?.courses?.total || 0, icon: BookOpen, color: 'bg-purple-500' },
    { title: 'Avg Test Score', value: `${data?.tests?.avg_score || 0}%`, icon: Award, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">System Overview</h1>
        <p className="mt-2 text-indigo-100">Complete analytics and insights</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Archetype Distribution</h2>
          <div className="space-y-3">
            {data?.archetype_distribution?.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 capitalize">{item.archetype}</span>
                  <span className="text-gray-500">{item.count} users</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.count / data.users.total) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performers</h2>
          <div className="space-y-3">
            {data?.top_performers?.slice(0, 5).map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{performer.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{performer.archetype}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{performer.courses_completed} courses</p>
                  <p className="text-xs text-gray-500">{performer.avg_test_score?.toFixed(1)}% avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}