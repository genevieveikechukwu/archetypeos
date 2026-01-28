import { useState, useEffect } from 'react';
import { getLearningHistory } from '../services/api';
import { BookOpen, Calendar, TrendingUp, MessageSquare, Search } from 'lucide-react';

export default function Reflections() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      const response = await getLearningHistory({ limit: 90 });
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to fetch reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const filteredHistory = history.filter(day => {
    if (filter === 'completed' && !day.meets_requirement) return false;
    if (filter === 'incomplete' && day.meets_requirement) return false;
    
    if (searchTerm) {
      const reflections = day.reflections?.join(' ').toLowerCase() || '';
      return reflections.includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  const totalDays = history.length;
  const completedDays = history.filter(d => d.meets_requirement).length;
  const totalHours = history.reduce((sum, d) => sum + parseFloat(d.hours), 0);
  const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Learning Reflections</h1>
        <p className="mt-2 text-purple-100">Your daily learning journey and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Total Days Tracked</p>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalDays}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Days Completed</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedDays}</p>
          <p className="text-xs text-gray-500 mt-1">{totalDays > 0 ? ((completedDays / totalDays) * 100).toFixed(0) : 0}% success rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Total Hours</p>
            <BookOpen className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">Last 90 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Avg Hours/Day</p>
            <MessageSquare className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgHoursPerDay}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({completedDays})
            </button>
            <button
              onClick={() => setFilter('incomplete')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'incomplete' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Incomplete ({totalDays - completedDays})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reflections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((day, index) => {
              const hasReflections = day.reflections && day.reflections.length > 0 && day.reflections.some(r => r && r.trim());
              
              return (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    day.meets_requirement
                      ? 'bg-green-50 border-green-200 hover:border-green-300'
                      : 'bg-orange-50 border-orange-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <strong>{day.session_count}</strong> sessions
                        </span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className={`text-sm font-bold ${
                          day.meets_requirement ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {day.hours} hours
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {day.meets_requirement ? (
                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                          ✓ Goal Met
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-medium">
                          Below Goal
                        </span>
                      )}
                    </div>
                  </div>

                  {hasReflections ? (
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Daily Reflections:</h4>
                      </div>
                      {day.reflections.filter(r => r && r.trim()).map((reflection, refIndex) => (
                        <div key={refIndex} className="pl-7">
                          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-gray-700 whitespace-pre-wrap">{reflection}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-7">
                      <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                        <p className="text-gray-500 italic">No reflection recorded for this day</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No reflections found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try a different search term' : 'Start logging your learning sessions to see reflections here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}