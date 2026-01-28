import { useState, useEffect } from 'react';
import { getMessages, sendMessage, getKudosReceived } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Award, Gift } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [kudos, setKudos] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [messagesRes, kudosRes] = await Promise.all([
        getMessages({}),
        getKudosReceived(),
      ]);
      setMessages(messagesRes.data.messages);
      setKudos(kudosRes.data.kudos);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        receiver_id: 1,
        message_text: newMessage,
      });
      setNewMessage('');
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send message');
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
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Communication Hub</h1>
        <p className="mt-2 text-pink-100">Connect with your team and celebrate achievements</p>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button onClick={() => setActiveTab('messages')} className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'messages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Messages
            </button>
            <button onClick={() => setActiveTab('kudos')} className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'kudos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Award className="h-5 w-5 inline mr-2" />
              Kudos ({kudos.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message to your supervisor..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button type="submit" disabled={!newMessage.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </button>
              </form>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div key={index} className={`p-4 rounded-lg ${msg.sender_id === user.id ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{msg.sender_id === user.id ? 'You' : msg.sender_name}</p>
                        <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-gray-700">{msg.message_text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-gray-400 text-sm mt-2">Start a conversation with your team!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'kudos' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{kudos.reduce((sum, k) => sum + k.points, 0)}</p>
                <p className="text-gray-600">Total Kudos Points</p>
              </div>

              <div className="space-y-3">
                {kudos.length > 0 ? (
                  kudos.map((k, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {k.from_user_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{k.from_user_name}</p>
                            <p className="text-sm text-gray-500">{new Date(k.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center bg-yellow-400 text-white px-3 py-1 rounded-full font-bold">
                          <Award className="h-4 w-4 mr-1" />
                          +{k.points}
                        </div>
                      </div>
                      <p className="text-gray-700 ml-13">{k.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No kudos received yet</p>
                    <p className="text-gray-400 text-sm mt-2">Keep up the great work!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}