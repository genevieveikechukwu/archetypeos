import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changeUsername, changePassword, toggleUserStatus, getSupervisors, getCourses, uploadCourseMaterial, addCourseContent, updateCourseContent, deleteCourseContent } from '../services/api';
import { Users, Plus, Edit, Trash2, Lock, Mail, Shield, BookOpen, Upload, Link2, X, Check, AlertCircle } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCourseContentModal, setShowCourseContentModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, supervisorsRes, coursesRes] = await Promise.all([
        getUsers(),
        getSupervisors(),
        getCourses()
      ]);
      setUsers(usersRes.data.users);
      setSupervisors(supervisorsRes.data.supervisors);
      setCourses(coursesRes.data.courses);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Admin Control Panel</h1>
        <p className="mt-2 text-indigo-100">Manage users, courses, and system settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'courses' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="h-5 w-5 inline mr-2" />
              Course & Materials
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <UserManagement
              users={users}
              supervisors={supervisors}
              onRefresh={fetchData}
              showUserModal={showUserModal}
              setShowUserModal={setShowUserModal}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
            />
          )}

          {activeTab === 'courses' && (
            <CourseManagement
              courses={courses}
              onRefresh={fetchData}
              showCourseContentModal={showCourseContentModal}
              setShowCourseContentModal={setShowCourseContentModal}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function UserManagement({ users, supervisors, onRefresh, showUserModal, setShowUserModal, editingUser, setEditingUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'learner',
    archetype: '',
    supervisor_id: ''
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'learner',
      archetype: '',
      supervisor_id: ''
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      archetype: user.archetype || '',
      supervisor_id: user.supervisor_id || ''
    });
    setShowUserModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          archetype: formData.archetype || null,
          supervisor_id: formData.supervisor_id || null
        });
        alert('User updated successfully!');
      } else {
        await createUser(formData);
        alert('User created successfully!');
      }
      setShowUserModal(false);
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleChangePassword = async (userId) => {
    const newPassword = prompt('Enter new password (min 8 characters):');
    if (newPassword && newPassword.length >= 8) {
      try {
        await changePassword(userId, newPassword);
        alert('Password changed successfully!');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to change password');
      }
    } else if (newPassword) {
      alert('Password must be at least 8 characters');
    }
  };

  const handleChangeEmail = async (userId, currentEmail) => {
    const newEmail = prompt('Enter new email:', currentEmail);
    if (newEmail && newEmail !== currentEmail) {
      try {
        await changeUsername(userId, newEmail);
        alert('Email changed successfully!');
        onRefresh();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to change email');
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    if (confirm('Are you sure you want to toggle this user status?')) {
      try {
        await toggleUserStatus(userId);
        alert('User status updated!');
        onRefresh();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to toggle status');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('WARNING: This will permanently delete the user and all their data. Continue?')) {
      try {
        await deleteUser(userId);
        alert('User deleted successfully!');
        onRefresh();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Users ({users.length})</h2>
          <p className="text-sm text-gray-600 mt-1">Create, edit, and manage user accounts</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archetype</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{user.archetype || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.supervisor_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.enrolled_courses || 0} / {user.completed_courses || 0}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleChangeEmail(user.id, user.email)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Change Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleChangePassword(user.id)}
                      className="text-orange-600 hover:text-orange-800"
                      title="Change Password"
                    >
                      <Lock className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={user.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      title={user.is_active ? 'Suspend' : 'Activate'}
                    >
                      {user.is_active ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUserModal && (
        <UserFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowUserModal(false)}
          editingUser={editingUser}
          supervisors={supervisors}
        />
      )}
    </div>
  );
}

function UserFormModal({ formData, setFormData, onSubmit, onClose, editingUser, supervisors }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required={!editingUser}
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="learner">Learner</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
              <option value="candidate">Candidate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archetype (Optional)</label>
            <select
              value={formData.archetype}
              onChange={(e) => setFormData({ ...formData, archetype: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None</option>
              <option value="maker">Maker</option>
              <option value="architect">Architect</option>
              <option value="connector">Connector</option>
              <option value="explorer">Explorer</option>
            </select>
          </div>

          {(formData.role === 'learner' || formData.role === 'candidate') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Supervisor</label>
              <select
                value={formData.supervisor_id}
                onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Supervisor</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.full_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onSubmit}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingUser ? 'Update User' : 'Create User'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseManagement({ courses, onRefresh, showCourseContentModal, setShowCourseContentModal, selectedCourse, setSelectedCourse }) {
  const [contentForm, setContentForm] = useState({
    title: '',
    content_type: 'video',
    content_url: '',
    file: null
  });

  const handleAddContent = (course) => {
    setSelectedCourse(course);
    setContentForm({
      title: '',
      content_type: 'video',
      content_url: '',
      file: null
    });
    setShowCourseContentModal(true);
  };

  const handleSubmitContent = async () => {
    try {
      if (contentForm.file) {
        const formData = new FormData();
        formData.append('file', contentForm.file);
        formData.append('title', contentForm.title);
        formData.append('content_type', contentForm.content_type);
        await uploadCourseMaterial(selectedCourse.id, formData);
      } else {
        await addCourseContent(selectedCourse.id, {
          title: contentForm.title,
          content_type: contentForm.content_type,
          content_url: contentForm.content_url
        });
      }
      alert('Content added successfully!');
      setShowCourseContentModal(false);
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add content');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Course Materials ({courses.length})</h2>
        <p className="text-sm text-gray-600 mt-1">Upload and manage course content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{course.difficulty}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <p>{course.enrolled_count || 0} enrolled</p>
              <p>{course.content_count || 0} materials</p>
            </div>

            <button
              onClick={() => handleAddContent(course)}
              className="w-full flex items-center justify-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Material
            </button>
          </div>
        ))}
      </div>

      {showCourseContentModal && (
        <CourseContentModal
          contentForm={contentForm}
          setContentForm={setContentForm}
          onSubmit={handleSubmitContent}
          onClose={() => setShowCourseContentModal(false)}
        />
      )}
    </div>
  );
}

function CourseContentModal({ contentForm, setContentForm, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Add Course Material</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Title</label>
            <input
              type="text"
              required
              value={contentForm.title}
              onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Introduction to JavaScript"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select
              value={contentForm.content_type}
              onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="link">External Link</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">Upload File</span>
              <input
                type="file"
                onChange={(e) => setContentForm({ ...contentForm, file: e.target.files[0] })}
                className="block w-full text-sm text-gray-500 mt-2"
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Or enter URL below</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Link2 className="h-4 w-4 inline mr-1" />
              URL (if not uploading file)
            </label>
            <input
              type="url"
              value={contentForm.content_url}
              onChange={(e) => setContentForm({ ...contentForm, content_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onSubmit}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Material
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}