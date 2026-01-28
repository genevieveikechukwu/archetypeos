import { useState, useEffect } from 'react';
import { sendFeedback, getAllFeedback, getNotifications, markNotificationRead, getSupervisors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Bell, CheckCircle, Users, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Feedback() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    receiver_id: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [messagesRes, notificationsRes] = await Promise.all([
        getAllFeedback(),
        getNotifications()
      ]);
      
      setMessages(messagesRes.data.messages || []);
      setNotifications(notificationsRes.data.notifications || []);
      
      if (user.role === 'learner' || user.role === 'candidate') {
        const supervisorsRes = await getSupervisors();
        const admins = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { users: [] } }));
        
        const adminUsers = admins.data.users?.filter(u => u.role === 'admin') || [];
        const allRecipients = [...(supervisorsRes.data.supervisors || []), ...adminUsers];
        
        const uniqueRecipients = allRecipients.filter((recipient, index, self) =>
          index === self.findIndex((r) => r.id === recipient.id)
        );
        
        setAvailableRecipients(uniqueRecipients);
      } else if (user.role === 'supervisor') {
        const token = localStorage.getItem('token');
        const [learnersRes, adminsRes] = await Promise.all([
          axios.get(`${API_URL}/supervisor/my-learners`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { learners: [] } })),
          axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { users: [] } }))
        ]);
        
        const learners = learnersRes.data.learners || [];
        const admins = adminsRes.data.users?.filter(u => u.role === 'admin') || [];
        setAvailableRecipients([...learners, ...admins]);
      } else if (user.role === 'admin') {
        const token = localStorage.getItem('token');
        const usersRes = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allUsers = usersRes.data.users?.filter(u => u.id !== user.id) || [];
        setAvailableRecipients(allUsers);
      }
    } catch (error) {
      console.error('Failed to fetch feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    
    if (!feedbackForm.receiver_id || !feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await sendFeedback(feedbackForm);
      alert('Feedback sent successfully!');
      setFeedbackForm({ receiver_id: '', subject: '', message: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send feedback');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      fetchData();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Feedback & Communication</h1>
        <p className="mt-2 text-blue-100">Connect with supervisors, learners, and admins</p>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'send' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Send className="h-5 w-5 inline mr-2" />
              Send Feedback
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'inbox' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Message History ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell className="h-5 w-5 inline mr-2" />
              Notifications ({unreadCount})
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'send' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Feedback</h2>
              
              {availableRecipients.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-700">
                    No recipients available. Please contact your administrator.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="h-4 w-4 inline mr-1" />
                      Send To
                    </label>
                    <select
                      value={feedbackForm.receiver_id}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, receiver_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select recipient...</option>
                      {availableRecipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.full_name} ({recipient.role}) - {recipient.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={feedbackForm.subject}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                      placeholder="What is this feedback about?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                      placeholder="Share your feedback, questions, or concerns..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="6"
                    />
                  </div>

                  <button
                    onClick={handleSendFeedback}
                    disabled={sending || !feedbackForm.receiver_id || !feedbackForm.subject.trim() || !feedbackForm.message.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    {sending ? 'Sending...' : 'Send Feedback'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Message History</h2>
                <p className="text-sm text-gray-600">{messages.length} total messages</p>
              </div>

              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg, index) => {
                    const isSent = msg.sender_id === user.id;
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          isSent ? 'bg-blue-50 border-blue-200 ml-8' : 'bg-gray-50 border-gray-200 mr-8'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                              isSent ? 'bg-blue-600' : 'bg-purple-600'
                            }`}>
                              {isSent ? msg.receiver_name?.charAt(0) : msg.sender_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {isSent ? (
                                  <span>
                                    <span className="text-gray-500">You</span>
                                    <ArrowRight className="h-4 w-4 inline mx-1" />
                                    <span>{msg.receiver_name}</span>
                                  </span>
                                ) : (
                                  <span>
                                    <span>{msg.sender_name}</span>
                                    <ArrowRight className="h-4 w-4 inline mx-1" />
                                    <span className="text-gray-500">You</span>
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {msg.sender_role} to {msg.receiver_role}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                        <div className="ml-13">
                          <p className="text-gray-700 whitespace-pre-wrap">{msg.message_text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No messages yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start a conversation by sending feedback!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        notification.is_read
                          ? 'bg-white border-gray-200'
                          : 'bg-blue-50 border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Bell className={`h-5 w-5 mr-2 ${notification.is_read ? 'text-gray-400' : 'text-blue-600'}`} />
                            <p className="font-bold text-gray-900">{notification.title}</p>
                            {!notification.is_read && (
                              <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 ml-7">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2 ml-7">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="ml-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No notifications</p>
                  <p className="text-gray-400 text-sm mt-2">You are all caught up!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}