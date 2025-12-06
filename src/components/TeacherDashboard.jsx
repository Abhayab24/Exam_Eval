import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

// Mock database for tests (would be from API in real app)
const getMockTests = () => {
  const saved = localStorage.getItem('teacherTests');
  return saved ? JSON.parse(saved) : [];
};

const TeacherDashboard = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedSection, setSelectedSection] = useState('10A');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [tests, setTests] = useState(getMockTests());
  
  const [newTest, setNewTest] = useState({
    title: '',
    subject: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    difficulty: 'Medium',
    sections: [],
    questions: [
      {
        id: 1,
        type: 'essay',
        text: '',
        marks: 25,
        wordLimit: 200
      }
    ]
  });

  const [newSection, setNewSection] = useState({ name: '', studentCount: '' });

  const stats = [
    { title: 'Total Tests Created', value: tests.length.toString(), icon: DocumentTextIcon, color: 'blue' },
    { title: 'Active Students', value: '156', icon: UserGroupIcon, color: 'green' },
    { title: 'Average Score', value: '78.5%', icon: ChartBarIcon, color: 'purple' },
    { title: 'Tests Assigned', value: `${tests.filter(t => t.isAssigned).length}`, icon: CalendarIcon, color: 'orange' },
  ];

  const [sections, setSections] = useState([
    { name: '10A', students: 28, avgScore: 82.5 },
    { name: '10B', students: 31, avgScore: 79.8 },
    { name: '11A', students: 25, avgScore: 85.2 },
    { name: '11B', students: 29, avgScore: 77.6 },
    { name: '12A', students: 22, avgScore: 88.1 },
    { name: '12B', students: 21, avgScore: 83.9 },
  ]);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English Literature', 'Computer Science', 'History', 'Geography'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const recentExams = tests
    .filter(test => test.isAssigned)
    .slice(0, 4)
    .map(test => ({
      subject: test.subject,
      section: test.assignedTo.join(', '),
      evaluated: Math.floor(Math.random() * 10),
      pending: Math.floor(Math.random() * 5),
      date: test.assignedDate
    }));

  useEffect(() => {
    localStorage.setItem('teacherTests', JSON.stringify(tests));
  }, [tests]);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
    };
    return colors[color] || colors.blue;
  };

  const handleAddSection = () => {
    if (newSection.name && newSection.studentCount) {
      const newSectionData = {
        name: newSection.name,
        students: parseInt(newSection.studentCount),
        avgScore: 0,
      };
      setSections([...sections, newSectionData]);
      setNewSection({ name: '', studentCount: '' });
      setShowAddSectionModal(false);
    }
  };

  const handleCreateTest = () => {
    if (!newTest.title || !newTest.subject || newTest.questions.length === 0) {
      alert('Please fill all required fields and add at least one question');
      return;
    }

    const testData = {
      id: Date.now().toString(),
      ...newTest,
      createdBy: currentUser?.name || 'Teacher',
      createdAt: new Date().toISOString(),
      isAssigned: false,
      assignedTo: [],
      assignedDate: null
    };

    setTests([...tests, testData]);
    setNewTest({
      title: '',
      subject: '',
      description: '',
      duration: 60,
      totalMarks: 100,
      difficulty: 'Medium',
      sections: [],
      questions: [
        {
          id: 1,
          type: 'essay',
          text: '',
          marks: 25,
          wordLimit: 200
        }
      ]
    });
    setShowCreateTestModal(false);
  };

  const handleAssignTest = (testId) => {
    const testToAssign = tests.find(t => t.id === testId);
    if (!testToAssign) return;

    const updatedTest = {
      ...testToAssign,
      isAssigned: true,
      assignedTo: [selectedSection],
      assignedDate: new Date().toISOString()
    };

    setTests(tests.map(t => t.id === testId ? updatedTest : t));
    
    // In a real app, you would send this to students via API
    const studentTests = JSON.parse(localStorage.getItem('studentTests') || '[]');
    studentTests.push({
      ...testToAssign,
      id: `${testId}_${selectedSection}`,
      assignedSection: selectedSection,
      isCompleted: false,
      studentAnswers: {},
      result: null
    });
    localStorage.setItem('studentTests', JSON.stringify(studentTests));

    setShowAssignTestModal(false);
    alert(`Test assigned to ${selectedSection}!`);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: newTest.questions.length + 1,
      type: 'essay',
      text: '',
      marks: 25,
      wordLimit: 200
    };
    setNewTest({
      ...newTest,
      questions: [...newTest.questions, newQuestion]
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newTest.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setNewTest({
      ...newTest,
      questions: updatedQuestions
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = newTest.questions.filter((_, i) => i !== index);
    setNewTest({
      ...newTest,
      questions: updatedQuestions
    });
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      setTests(tests.filter(test => test.id !== testId));
    }
  };

  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {currentUser?.name}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your tests, track student performance, and create new assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(stat.color)}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowCreateTestModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Test
          </button>
          <button
            onClick={() => setShowAddSectionModal(true)}
            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Section
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Tests ({tests.length})
              </h2>
            </div>
            
            {tests.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No tests created yet</p>
                <p>Create your first test to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {test.title}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {test.subject} • {test.duration} mins • {test.totalMarks} marks
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {test.difficulty}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            test.isAssigned 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {test.isAssigned ? 'Assigned' : 'Draft'}
                          </span>
                          {test.isAssigned && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                            }`}>
                              To: {test.assignedTo.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!test.isAssigned && (
                          <button
                            onClick={() => {
                              setSelectedTest(test.id);
                              setShowAssignTestModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            title="Assign Test"
                          >
                            <CalendarIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                          title="Delete Test"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {test.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {test.questions.length} questions • Created on {new Date(test.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => navigate(`/test/${test.id}`)}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                Sections Overview
              </h2>
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSection === section.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isDark
                          ? 'border-gray-700 bg-gray-900 hover:bg-gray-800'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedSection(section.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Class {section.name}
                      </h3>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {section.students} students
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Avg Score:
                      </span>
                      <span className={`ml-2 font-bold ${
                        section.avgScore >= 80 ? 'text-green-600 dark:text-green-400' : 
                        section.avgScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {section.avgScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                Recent Assigned Tests
              </h2>
              <div className="space-y-4">
                {recentExams.length === 0 ? (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No tests assigned yet
                  </p>
                ) : (
                  recentExams.map((exam, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {exam.subject}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                          {exam.section}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {exam.evaluated} evaluated
                        </span>
                        {exam.pending > 0 && (
                          <span className="text-orange-600 font-medium">
                            {exam.pending} pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Add New Section
                </h3>
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Section Name
                  </label>
                  <input
                    type="text"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value.toUpperCase() })}
                    placeholder="e.g., 10A"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of Students
                  </label>
                  <input
                    type="number"
                    value={newSection.studentCount}
                    onChange={(e) => setNewSection({ ...newSection, studentCount: e.target.value })}
                    placeholder="e.g., 30"
                    min="1"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSection}
                  disabled={!newSection.name || !newSection.studentCount}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Test Modal */}
        {showCreateTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-4xl my-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Create New Test
                </h3>
                <button
                  onClick={() => setShowCreateTestModal(false)}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Test Title *
                    </label>
                    <input
                      type="text"
                      value={newTest.title}
                      onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                      placeholder="e.g., Midterm Examination"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Subject *
                    </label>
                    <select
                      value={newTest.subject}
                      onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="Describe the test content and objectives..."
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newTest.duration}
                      onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                      min="10"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={newTest.totalMarks}
                      onChange={(e) => setNewTest({ ...newTest, totalMarks: parseInt(e.target.value) })}
                      min="10"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Difficulty Level
                    </label>
                    <select
                      value={newTest.difficulty}
                      onChange={(e) => setNewTest({ ...newTest, difficulty: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Questions ({newTest.questions.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newTest.questions.map((question, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Question {index + 1}
                          </h4>
                          {newTest.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(index)}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Marks
                            </label>
                            <input
                              type="number"
                              value={question.marks}
                              onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value))}
                              min="1"
                              className={`w-full px-3 py-2 rounded border ${
                                isDark 
                                  ? 'bg-gray-800 border-gray-700 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Word Limit
                            </label>
                            <input
                              type="number"
                              value={question.wordLimit}
                              onChange={(e) => handleQuestionChange(index, 'wordLimit', parseInt(e.target.value))}
                              min="50"
                              className={`w-full px-3 py-2 rounded border ${
                                isDark 
                                  ? 'bg-gray-800 border-gray-700 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Question Text *
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                            placeholder="Enter the question..."
                            rows="3"
                            className={`w-full px-3 py-2 rounded border ${
                              isDark 
                                ? 'bg-gray-800 border-gray-700 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateTestModal(false)}
                  className={`px-6 py-2 rounded-lg border ${
                    isDark 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTest}
                  disabled={!newTest.title || !newTest.subject || newTest.questions.some(q => !q.text)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Test Modal */}
        {showAssignTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Assign Test
                </h3>
                <button
                  onClick={() => {
                    setShowAssignTestModal(false);
                    setSelectedTest(null);
                  }}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Section
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {sections.map(section => (
                      <option key={section.name} value={section.name}>
                        Class {section.name} ({section.students} students)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Test to assign:
                  </p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {tests.find(t => t.id === selectedTest)?.title}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tests.find(t => t.id === selectedTest)?.subject} • {tests.find(t => t.id === selectedTest)?.questions.length} questions
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignTestModal(false);
                    setSelectedTest(null);
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignTest(selectedTest)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Assign to {selectedSection}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;