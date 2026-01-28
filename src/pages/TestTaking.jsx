import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function TestTaking() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && currentAttempt) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, currentAttempt]);

  const fetchTestData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTest(response.data.test);
      setQuestions(response.data.questions);
      
      if (response.data.test.time_limit_minutes) {
        setTimeRemaining(response.data.test.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
      setError('Failed to load test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/tests/${testId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentAttempt(response.data.attempt);
      alert('Test started! Good luck!');
    } catch (error) {
      console.error('Failed to start test:', error);
      alert(error.response?.data?.error || 'Failed to start test');
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleAutoSubmit = async () => {
    alert('Time is up! Submitting your test automatically.');
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!currentAttempt) return;

    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered questions. Submit anyway?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        answer_text: q.question_type === 'multiple_choice' ? null : answers[q.id],
        selected_option_id: q.question_type === 'multiple_choice' ? answers[q.id] : null
      }));

      const response = await axios.post(
        `${API_URL}/tests/attempts/${currentAttempt.id}/submit`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.score !== null) {
        alert(`Test submitted! Your score: ${response.data.score}%`);
      } else {
        alert('Test submitted successfully! Awaiting manual grading.');
      }
      
      navigate('/courses');
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert(error.response?.data?.error || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 text-red-700 underline"
          >
            Return to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!currentAttempt) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{test.title}</h1>
          {test.description && (
            <p className="text-gray-600 mb-6">{test.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Questions</p>
              <p className="text-2xl font-bold text-blue-900">{questions.length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Passing Score</p>
              <p className="text-2xl font-bold text-purple-900">{test.passing_score}%</p>
            </div>
            {test.time_limit_minutes && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Time Limit</p>
                <p className="text-2xl font-bold text-orange-900">{test.time_limit_minutes} min</p>
              </div>
            )}
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Test Type</p>
              <p className="text-lg font-bold text-green-900 capitalize">{test.test_type.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Instructions</p>
                <ul className="text-sm text-yellow-800 mt-2 list-disc list-inside space-y-1">
                  <li>Answer all questions to the best of your ability</li>
                  {test.time_limit_minutes && <li>You have {test.time_limit_minutes} minutes to complete this test</li>}
                  <li>Once submitted, you cannot change your answers</li>
                  {test.test_type === 'multiple_choice' && <li>You will receive your score immediately after submission</li>}
                  {test.test_type !== 'multiple_choice' && <li>Your test will be manually graded by your supervisor</li>}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartTest}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {timeRemaining !== null && (
        <div className={`sticky top-4 z-10 p-4 rounded-lg shadow-lg ${
          timeRemaining < 300 ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'
        } border-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className={`h-5 w-5 mr-2 ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`} />
              <span className={`font-bold ${timeRemaining < 300 ? 'text-red-900' : 'text-blue-900'}`}>
                Time Remaining: {formatTime(timeRemaining)}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {Object.keys(answers).length} / {questions.length} answered
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{test.title}</h1>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900">{question.question_text}</p>
                  <p className="text-sm text-gray-500 mt-1">Points: {question.points}</p>
                </div>
              </div>

              {question.question_type === 'multiple_choice' && question.options ? (
                <div className="ml-11 space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        answers[question.id] === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => handleAnswerChange(question.id, option.id)}
                        className="mr-3"
                      />
                      <span className="text-gray-900">{option.option_text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="ml-11">
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="6"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} of {questions.length} questions answered
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            <Send className="h-5 w-5 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
}