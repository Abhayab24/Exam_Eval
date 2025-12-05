import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [userType, setUserType] = useState('student'); // Only for UI, not backend
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // 🚀 UPDATED LOGIN HANDLER (Fix Alert Issue)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);  // ❗ removed userType
      if (!user) return alert("Login failed.");

      // Login success → Redirect
      navigate(user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard");
    } catch (error) {
      alert("Login failed. Check credentials.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">

        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sign in to your account
          </h2>
          <p className={`mt-2 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>

        {/* UI ONLY — Does NOT affect backend */}
        <div className="flex space-x-4">
          <button type="button" onClick={() => setUserType('student')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
              userType === 'student' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
              isDark ? 'border-gray-700 bg-gray-800 hover:border-gray-600' :
              'border-gray-300 bg-white hover:border-gray-400'
            }`}>
            <UserIcon className={`h-8 w-8 mx-auto mb-2 ${userType === 'student' ? 'text-blue-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`font-medium ${userType === 'student' ? 'text-blue-600' : isDark ? 'text-white' : 'text-gray-900'}`}>
              Student
            </div>
          </button>

          <button type="button" onClick={() => setUserType('teacher')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
              userType === 'teacher' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
              isDark ? 'border-gray-700 bg-gray-800 hover:border-gray-600' :
              'border-gray-300 bg-white hover:border-gray-400'
            }`}>
            <AcademicCapIcon className={`h-8 w-8 mx-auto mb-2 ${userType === 'teacher' ? 'text-blue-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`font-medium ${userType === 'teacher' ? 'text-blue-600' : isDark ? 'text-white' : 'text-gray-900'}`}>
              Teacher
            </div>
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="mt-1 relative">
                <input id="email" name="email" type="email" required
                  value={formData.email} onChange={handleInputChange}
                  className={`appearance-none w-full px-3 py-2 pl-10 border rounded-md
                    ${isDark ? 'border-gray-700 bg-gray-800 text-white' :
                    'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Enter your email"
                />
                <EnvelopeIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="mt-1 relative">
                <input id="password" name="password"
                  type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleInputChange}
                  className={`appearance-none w-full px-3 py-2 pl-10 pr-10 border rounded-md
                    ${isDark ? 'border-gray-700 bg-gray-800 text-white' :
                    'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Enter your password"
                />
                <LockClosedIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium">
            Sign in as {userType === 'student' ? 'Student' : 'Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
