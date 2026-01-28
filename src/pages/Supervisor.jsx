import { useState, useEffect } from 'react';
import { getMyLearners, getLearnerTimeAnalytics, getLearnerCompliance, flagLearner } from '../services/api';
import { Users, TrendingUp, Clock, AlertTriangle, BarChart3, Calendar, Flag, X } from 'lucide-react';

export default function Supervisor() {
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagData, setFlagData] = useState({ reason: '', severity: 'medium' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearners();
  }, []);

  useEffect(() => {
    if (selectedLearner) {
      fetchLearnerData();
    }
  }, [selectedLearner, period]);

  const fetchLearners = async () => {
    try {
      const response = await getMyLearners();
      setLearners(response.data.learners);
      if (response.data.learners.length > 0) {
        setSelectedLearner(response.data.learners[0]);
      }
    } catch (error) {
      console.error('Failed to fetch learners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearnerData = async () => {
    if (!selectedLearner) return;
    try {
      const [analyticsRes, complianceRes] = await Promise.all([
        getLearnerTimeAnalytics(selectedLearner.id, period),
        getLearnerCompliance(selectedLearner.id)
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setCompliance(complianceRes.data.compliance);
    } catch (error) {
      console.error('Failed to fetch learner data:', error);
    }
  };

  const handleFlagLearner = async () => {
    if (!flagData.reason.trim()) {
      alert('Please provide a reason for flagging');
      return;
    }

    try {
      await flagLearner(selectedLearner.id, flagData);
      alert('Learner flagged successfully!');
      setShowFlagModal(false);
      setFlagData({ reason: '', severity: 'medium' });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to flag learner');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="mt-2 text-purple-100">Monitor and evaluate your learners</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No learners assigned to you yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="mt-2 text-purple-100">Monitor and evaluate your learners ({learners.length})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Learners</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {learners.map((learner) => (
                <button
                  key={learner.id}
                  onClick={() => setSelectedLearner(learner)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedLearner?.id === learner.id
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-900">{learner.full_name}</div>
                  <div className="text-sm text-gray-500">{learner.email}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">{learner.days_logged_this_month} days logged</span>
                    {parseFloat(learner.total_hours_this_month || 0) < 120 && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selectedLearner && (
            <>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedLearner.full_name}</h2>
                    <p className="text-gray-600">{selectedLearner.email}</p>
                    {selectedLearner.archetype && (
                      <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                        {selectedLearner.archetype}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowFlagModal(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Learner
                  </button>
                </div>
              </div>

              {compliance && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 font-medium">Days Logged</p>
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{compliance.days_logged}</p>
                    <p className="text-xs text-gray-500 mt-1">{compliance.days_met_goal} met goal</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 font-medium">Total Hours</p>
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{compliance.total_hours}</p>
                    <p className="text-xs text-gray-500 mt-1">this month</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 font-medium">Compliance Rate</p>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{compliance.compliance_rate}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          compliance.compliance_rate >= 80 ? 'bg-green-500' :
                          compliance.compliance_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${compliance.compliance_rate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 font-medium">Diligence Score</p>
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{compliance.diligence_score}%</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                      compliance.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      compliance.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      compliance.status === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {compliance.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Time Analytics</h3>
                  <div className="flex space-x-2">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          period === p
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {analytics && analytics.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.map((item, index) => {
                      const date = new Date(item.period);
                      const hours = parseFloat(item.total_hours || 0);
                      const maxHours = Math.max(...analytics.map(a => parseFloat(a.total_hours || 0)));
                      const barWidth = maxHours > 0 ? (hours / maxHours) * 100 : 0;

                      return (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {period === 'daily' && date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {period === 'weekly' && `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                {period === 'monthly' && date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                {period === 'yearly' && date.getFullYear()}
                              </p>
                              <p className="text-sm text-gray-600">{item.session_count} sessions, {item.days_active} days</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-purple-600">{hours.toFixed(1)} hrs</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No data available for this period
                  </div>
                )}
              </div>

              {compliance && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Average Hours/Day</p>
                      <p className="text-2xl font-bold text-blue-900">{compliance.avg_hours_per_day}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Days Met Goal (6+ hrs)</p>
                      <p className="text-2xl font-bold text-green-900">{compliance.days_met_goal} / {compliance.days_logged}</p>
                    </div>
                  </div>

                  {compliance.status === 'critical' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <p className="text-sm font-medium text-red-800">
                          This learner is significantly underperforming. Consider flagging for review.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Flag Learner</h3>
              <button onClick={() => setShowFlagModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  The learner and admins will be notified of this flag.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level</label>
                <select
                  value={flagData.severity}
                  onChange={(e) => setFlagData({ ...flagData, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Low - Minor Issue</option>
                  <option value="medium">Medium - Needs Attention</option>
                  <option value="high">High - Urgent Action Required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Flagging</label>
                <textarea
                  value={flagData.reason}
                  onChange={(e) => setFlagData({ ...flagData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  rows="4"
                  placeholder="Describe the performance issue, behavioral concern, or other reason for flagging..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleFlagLearner}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Flag Learner
                </button>
                <button
                  onClick={() => setShowFlagModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}