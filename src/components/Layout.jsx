import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Clock, Award, MessageSquare, LogOut, Menu, X, Users, Shield, TrendingUp, Send } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const common = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];

    if (user?.role === 'admin') {
      return [
        ...common,
        { name: 'Admin Panel', path: '/admin', icon: Shield },
        { name: 'All Courses', path: '/courses', icon: BookOpen },
        { name: 'Feedback', path: '/feedback', icon: Send },
      ];
    }

    if (user?.role === 'supervisor') {
      return [
        ...common,
        { name: 'Team Management', path: '/supervisor', icon: Users },
        { name: 'Feedback', path: '/feedback', icon: Send },
      ];
    }

    return [
      ...common,
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'Learning', path: '/learning', icon: Clock },
      { name: 'Reflections', path: '/reflections', icon: MessageSquare }, 
      { name: 'Skills', path: '/skills', icon: Award },
      { name: 'Feedback', path: '/feedback', icon: Send },
    ];
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex-shrink-0 flex items-center ml-2 lg:ml-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ArchetypeOS</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                  user?.role === 'admin' ? 'bg-indigo-600' :
                  user?.role === 'supervisor' ? 'bg-purple-600' :
                  'bg-blue-600'
                }`}>
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? user?.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-600'
                        : user?.role === 'supervisor'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? user?.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-600'
                          : user?.role === 'supervisor'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                ))}
              </nav>

              {user?.archetype && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="px-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Your Archetype
                    </p>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.archetype.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 capitalize">{user.archetype}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user?.role && (
                <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</p>
                  <p className="text-sm font-bold text-gray-900 capitalize flex items-center">
                    {user.role === 'admin' && <Shield className="h-4 w-4 mr-1 text-indigo-600" />}
                    {user.role === 'supervisor' && <Users className="h-4 w-4 mr-1 text-purple-600" />}
                    {(user.role === 'learner' || user.role === 'candidate') && <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />}
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}