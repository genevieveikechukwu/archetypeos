import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserSkills, getLearningHistory, getStreak } from '../services/api';
import axios from 'axios';
import { ArrowLeft, BookOpen, Clock, Award, TrendingUp, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function LearnerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [learner, setLearner] = useState(null);
  const [skills, setSkills] = useState([]);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearnerData();
  }, [userId]);

  const fetchLearnerData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [userRes, skillsRes, historyRes, streakRes, enrollmentsRes] = await Promise.all([
        axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        getUserSkills(userId),
        getLearningHistory({ limit: 30 }),
        getStreak(),
        axios.get(`${API_URL}/courses/my/enrollments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      setLearner(userRes.data);
      setSkills(skillsRes.data.skill_profile);
      setHistory(historyRes.data.history);
      setStreak(streakRes.data.current_streak);
      setEnrollments(enrollmentsRes.data.enrollments);
    } catch (error) {
      console.error('Failed to fetch learner data:', error);
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

  const totalHours = history.reduce((sum, day) => sum + parseFloat(day.hours), 0);
  const avgHoursPerDay = history.length > 0 ? (totalHours / history.length).toFixed(1) : 0;
  const completedCourses = enrollments.filter(e => e.completed_at).length;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{learner?.full_name}</h1>
            <p className="mt-2 text-blue-100">{learner?.email}</p>
            {learner?.archetype && (
              <span className="inline-block mt-3 px-4 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
                {learner.archetype} Archetype
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Role</p>
            <p className="text-2xl font-bold capitalize">{learner?.role}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completed Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completedCourses}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Learning Hours</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalHours.toFixed(1)}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{streak} <span className="text-lg text-gray-500">days</span></p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Hours/Day</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgHoursPerDay}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-6 w-6 mr-2 text-yellow-500" />
            Skills Overview
          </h2>
          {skills.length > 0 ? (
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{skill.skill_name}</span>
                    <span className="text-gray-500">{skill.level.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(skill.level / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No skills tracked yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-blue-500" />
            Course Progress
          </h2>
          {enrollments.length > 0 ? (
            <div className="space-y-3">
              {enrollments.map((enrollment, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900">{enrollment.title}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      enrollment.is_completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {enrollment.is_completed ? 'Completed' : `${enrollment.progress_percentage}%`}
                    </span>
                  </div>
                  {!enrollment.is_completed && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No courses enrolled</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Learning History (Last 30 Days)</h2>
        <div className="space-y-2">
          {history.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm text-gray-600">{day.session_count} sessions</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${day.meets_requirement ? 'text-green-600' : 'text-orange-600'}`}>
                  {day.hours} hrs
                </p>
                {day.meets_requirement && (
                  <span className="text-xs text-green-600 font-medium">✓ Goal met</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}