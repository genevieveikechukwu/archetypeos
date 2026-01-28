import { useState, useEffect } from 'react';
import { getUserSkills, getSkills } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, TrendingUp, Target } from 'lucide-react';

export default function Skills() {
  const { user } = useAuth();
  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const [userSkillsRes, allSkillsRes] = await Promise.all([
        getUserSkills(user.id),
        getSkills(),
      ]);
      setUserSkills(userSkillsRes.data.skill_profile);
      setAllSkills(allSkillsRes.data.skills);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Your Skills</h1>
        <p className="mt-2 text-purple-100">Track your skill development and growth</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Total Skills</p>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{userSkills.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Avg Level</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {userSkills.length > 0 
              ? (userSkills.reduce((sum, s) => sum + s.level, 0) / userSkills.length).toFixed(1)
              : '0.0'}
            <span className="text-lg text-gray-500 ml-1">/ 5.0</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Top Skill</p>
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {userSkills.length > 0 ? userSkills[0].skill_name : 'None yet'}
          </p>
          {userSkills.length > 0 && (
            <p className="text-sm text-gray-500">Level {userSkills[0].level.toFixed(1)}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Breakdown</h2>
        
        {userSkills.length > 0 ? (
          <div className="space-y-6">
            {userSkills.map((skill, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{skill.skill_name}</h3>
                    {skill.skill_description && (
                      <p className="text-sm text-gray-600 mt-1">{skill.skill_description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-blue-600">{skill.level.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">/ 5.0</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(skill.level / 5) * 100}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Courses Completed</p>
                    <p className="font-bold text-gray-900">{skill.courses_completed}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Test Average</p>
                    <p className="font-bold text-gray-900">{skill.test_average.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Supervisor Rating</p>
                    <p className="font-bold text-gray-900">{skill.supervisor_rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No skills tracked yet</p>
            <p className="text-gray-400 text-sm mt-2">Complete courses to build your skill profile!</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Available Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allSkills.map((skill) => {
            const userSkill = userSkills.find(us => us.skill_id === skill.id);
            return (
              <div key={skill.id} className={`p-4 rounded-lg border-2 transition-all ${userSkill ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <p className="font-medium text-gray-900">{skill.name}</p>
                {userSkill ? (
                  <p className="text-sm text-blue-600 font-bold mt-1">Level {userSkill.level.toFixed(1)}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Not started</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}