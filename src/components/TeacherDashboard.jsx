import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useUploads } from '../contexts/UploadContext';
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
  AcademicCapIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingLibraryIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

// Mock database for tests
const getMockTests = () => {
  const saved = localStorage.getItem('teacherTests');
  return saved ? JSON.parse(saved) : [];
};

const TeacherDashboard = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const { uploads, teacherUploads, addTeacherUpload, deleteTeacherUpload, getFile, fileStorage } = useUploads();
  const navigate = useNavigate();

  const [selectedSection, setSelectedSection] = useState('10A');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [showViewUploadModal, setShowViewUploadModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedUpload, setSelectedUpload] = useState(null);
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tests', 'uploads'

  const stats = [
    { title: 'Total Tests Created', value: tests.length.toString(), icon: DocumentTextIcon, color: 'blue' },
    { title: 'Student Uploads', value: uploads.length.toString(), icon: CloudArrowUpIcon, color: 'green' },
    { title: 'Average Score', value: '78.5%', icon: ChartBarIcon, color: 'purple' },
    { title: 'Active Students', value: '156', icon: UserGroupIcon, color: 'orange' },
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

  // Get recent exams for the selected section
  const recentExams = tests
    .filter(test => test.isAssigned && test.assignedTo.includes(selectedSection))
    .slice(0, 4)
    .map(test => ({
      ...test,
      evaluated: Math.floor(Math.random() * 10),
      pending: Math.floor(Math.random() * 5)
    }));

  // Get uploads for selected section
  const sectionUploads = uploads.filter(upload => 
    upload.studentInfo?.class?.includes(selectedSection)
  );

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

  const handleViewUploadDetails = (upload) => {
    setSelectedUpload(upload);
    setShowViewUploadModal(true);
  };

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64, mimeType) => {
    try {
      const byteCharacters = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      // Create a dummy file if conversion fails
      return new Blob(['File content not available'], { type: 'text/plain' });
    }
  };

  // Function to download a specific file
  const handleDownloadFile = (fileId, fileName) => {
    const fileData = getFile(fileId);
    if (fileData && fileData.data) {
      const blob = base64ToBlob(fileData.data, fileData.type || 'application/octet-stream');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || fileData.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('File not found or not available for download.');
    }
  };

  // Function to download all files from an upload
  const handleDownloadAllFiles = async (upload) => {
    if (!upload.files || upload.files.length === 0) {
      alert('No files to download.');
      return;
    }

    if (upload.files.length === 1) {
      // Single file - download directly
      const file = upload.files[0];
      handleDownloadFile(file.id, `${upload.studentInfo?.name || 'student'}_${file.name}`);
    } else {
      // Multiple files - download individually
      for (let i = 0; i < upload.files.length; i++) {
        const file = upload.files[i];
        setTimeout(() => {
          handleDownloadFile(file.id, `${upload.studentInfo?.name || 'student'}_${file.name}`);
        }, i * 500); // Stagger downloads
      }
    }
  };

  // Function to download evaluation report
  const handleDownloadReport = (upload) => {
    const report = {
      student: upload.studentInfo,
      files: upload.files?.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        uploadType: f.uploadType
      })),
      evaluation: upload.result,
      uploadedAt: upload.uploadedAt,
      uploadedBy: upload.uploadedBy
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-report-${upload.studentInfo?.name || 'student'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    } else if (file.type?.includes('pdf')) {
      return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
    } else if (file.type?.includes('word') || file.type?.includes('document')) {
      return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
    }
    return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    if (grade === 'A+' || grade === 'A') return 'text-green-500';
    if (grade === 'B+' || grade === 'B') return 'text-blue-500';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-500';
    if (grade === 'D+' || grade === 'D') return 'text-orange-500';
    return 'text-red-500'; 
  };

  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'}`}>
            Teacher Dashboard
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
            Welcome back, {currentUser?.name}! Manage your classes and student submissions.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className={`flex space-x-1 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-inner`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'tests'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tests ({tests.length})
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'uploads'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Student Uploads ({uploads.length})
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(stat.color)} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowCreateTestModal(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Test
          </button>
          <button
            onClick={() => setShowAddSectionModal(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Section
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Upload Materials
          </button>
        </div>

        {/* Main Content based on Active Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tests Overview */}
            <div className={`lg:col-span-2 ${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-xl p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Tests
                </h2>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  View All →
                </button>
              </div>
              
              {tests.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No tests created yet</p>
                  <p>Create your first test to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.slice(0, 3).map((test) => (
                    <div
                      key={test.id}
                      className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'} hover:shadow-lg transition-all duration-200`}
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
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            }`}>
                              {test.isAssigned ? 'Assigned' : 'Draft'}
                            </span>
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
                        </div>
                      </div>
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {test.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {test.questions.length} questions
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

            {/* Right Column - Sections & Recent Uploads */}
            <div className="space-y-8">
              {/* Sections Overview */}
              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-xl p-6`}>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                  Sections Overview
                </h2>
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedSection === section.name
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30'
                          : isDark
                            ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
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

              {/* Recent Uploads */}
              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-xl p-6`}>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                  Recent Uploads
                </h2>
                <div className="space-y-4">
                  {uploads.length === 0 ? (
                    <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No student uploads yet
                    </p>
                  ) : (
                    uploads.slice(0, 3).map((upload, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} hover:shadow-md transition-all duration-200 cursor-pointer`}
                        onClick={() => handleViewUploadDetails(upload)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {upload.studentInfo?.name || 'Student'}
                          </h3>
                          {upload.result?.grade && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              getGradeColor(upload.result.grade).replace('text-', 'bg-').replace('500', '100') + ' ' + 
                              getGradeColor(upload.result.grade)
                            }`}>
                              {upload.result.grade}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {upload.studentInfo?.class || 'Unknown Class'} • {upload.studentInfo?.subject || 'Unknown Subject'}
                        </p>
                        <div className="flex items-center justify-between text-xs mt-2">
                          <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                            {upload.files?.length || 0} files
                          </span>
                          <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                            {new Date(upload.uploadedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Tests ({tests.length})
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateTestModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Test
                </button>
              </div>
            </div>
            
            {tests.length === 0 ? (
              <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <AcademicCapIcon className="h-20 w-20 mx-auto mb-6 opacity-50" />
                <p className="text-xl mb-3">No tests created yet</p>
                <p className="mb-6">Create your first test to get started</p>
                <button
                  onClick={() => setShowCreateTestModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Create First Test
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-6 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'} hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {test.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {test.subject}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            test.isAssigned 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                          }`}>
                            {test.isAssigned ? 'Assigned' : 'Draft'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isDark ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {test.questions.length} Qs
                          </span>
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
                    
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {test.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <span className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {test.duration}m
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {test.totalMarks} marks
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {test.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Created {new Date(test.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => navigate(`/test/${test.id}`)}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
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
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Student Uploads ({uploads.length})
              </h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Sections</option>
                  {sections.map(section => (
                    <option key={section.name} value={section.name}>
                      Class {section.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {uploads.length === 0 ? (
              <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <CloudArrowUpIcon className="h-20 w-20 mx-auto mb-6 opacity-50" />
                <p className="text-xl mb-3">No student uploads yet</p>
                <p className="mb-6">Students will appear here when they upload their work</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Upload Sample Materials
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(selectedSection === 'all' ? uploads : sectionUploads).map((upload, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'} hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                          <UserIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {upload.studentInfo?.name || 'Student'}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <BuildingLibraryIcon className="h-4 w-4 mr-1" />
                              {upload.studentInfo?.class || 'Unknown Class'}
                            </span>
                            <span className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <BookOpenIcon className="h-4 w-4 mr-1" />
                              {upload.studentInfo?.subject || 'Unknown Subject'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {upload.result && (
                          <div className="text-right">
                            <div className="flex items-center">
                              <span className={`text-2xl font-bold mr-2 ${getGradeColor(upload.result.grade)}`}>
                                {upload.result.grade}
                              </span>
                              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {upload.result.totalMarks}/{upload.result.maxMarks}
                              </span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {Math.round((upload.result.totalMarks / upload.result.maxMarks) * 100)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Uploaded Files ({upload.files?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {upload.files?.slice(0, 3).map((file, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} cursor-pointer hover:opacity-80`}
                            onClick={() => handleDownloadFile(file.id, `${upload.studentInfo?.name || 'student'}_${file.name}`)}
                            title={`Click to download: ${file.name}`}
                          >
                            {getFileIcon(file)}
                            <span className={`ml-2 text-sm truncate max-w-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {file.name}
                            </span>
                            <span className={`ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                        ))}
                        {upload.files?.length > 3 && (
                          <span className={`px-3 py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            +{upload.files.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {upload.result?.feedback && (
                      <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {upload.result.feedback}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Uploaded {new Date(upload.uploadedAt || Date.now()).toLocaleDateString()}
                        {upload.uploadedBy && ` by ${upload.uploadedBy}`}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUploadDetails(upload)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <EyeIcon className="h-4 w-4 inline mr-2" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAllFiles(upload)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
                          Download Files
                        </button>
                        <button
                          onClick={() => handleDownloadReport(upload)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            isDark 
                              ? 'bg-purple-600 text-white hover:bg-purple-700' 
                              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                          }`}
                        >
                          <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                          Report
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Add New Section
                </h3>
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
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
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } hover:scale-105`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSection}
                  disabled={!newSection.name || !newSection.studentCount}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Test Modal */}
                {/* Create Test Modal */}
        {showCreateTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-4xl my-8 shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Create New Test
                </h3>
                <button
                  onClick={() => setShowCreateTestModal(false)}
                  className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
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
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Subject *
                    </label>
                    <select
                      value={newTest.subject}
                      onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
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
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                      onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) || 60 })}
                      min="10"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={newTest.totalMarks}
                      onChange={(e) => setNewTest({ ...newTest, totalMarks: parseInt(e.target.value) || 100 })}
                      min="10"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Difficulty Level
                    </label>
                    <select
                      value={newTest.difficulty}
                      onChange={(e) => setNewTest({ ...newTest, difficulty: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
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
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newTest.questions.map((question, index) => (
                      <div key={index} className={`p-6 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Question {index + 1}
                          </h4>
                          {newTest.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(index)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
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
                              onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value) || 25)}
                              min="1"
                              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
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
                              onChange={(e) => handleQuestionChange(index, 'wordLimit', parseInt(e.target.value) || 200)}
                              min="50"
                              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
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
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
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
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } hover:scale-105`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTest}
                  disabled={!newTest.title || !newTest.subject || newTest.questions.some(q => !q.text)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Assign Test
                </h3>
                <button
                  onClick={() => {
                    setShowAssignTestModal(false);
                    setSelectedTest(null);
                  }}
                  className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
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
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {sections.map(section => (
                      <option key={section.name} value={section.name}>
                        Class {section.name} ({section.students} students)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Test to assign:
                  </p>
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } hover:scale-105`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignTest(selectedTest)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105"
                >
                  Assign to {selectedSection}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Upload Details Modal */}
        {showViewUploadModal && selectedUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-blue-100'} mr-4`}>
                      <UserIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUpload.studentInfo?.name || 'Student'}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Upload Details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewUploadModal(false)}
                    className={`p-3 rounded-full hover:scale-110 transition-all duration-200 ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Student Information */}
                <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-6 mb-8`}>
                  <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</p>
                      <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUpload.studentInfo?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Class/Grade</p>
                      <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUpload.studentInfo?.class || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Subject</p>
                      <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUpload.studentInfo?.subject || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evaluation Result */}
                {selectedUpload.result && (
                  <div className={`${isDark ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-2xl p-6 mb-8`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        AI Evaluation Result
                      </h3>
                      <span className={`px-4 py-2 rounded-full font-bold ${
                        getGradeColor(selectedUpload.result.grade).replace('text-', 'bg-').replace('500', '100') + ' ' + 
                        getGradeColor(selectedUpload.result.grade)
                      }`}>
                        Grade: {selectedUpload.result.grade}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Score</p>
                        <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedUpload.result.totalMarks}/{selectedUpload.result.maxMarks}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          ({Math.round((selectedUpload.result.totalMarks / selectedUpload.result.maxMarks) * 100)}%)
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Feedback</p>
                        <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {selectedUpload.result.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploaded Files */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Uploaded Files ({selectedUpload.files?.length || 0})
                    </h3>
                    <button
                      onClick={() => handleDownloadAllFiles(selectedUpload)}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-blue-800"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedUpload.files?.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          isDark ? 'bg-gray-900' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <div className="ml-4">
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {file.name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {formatFileSize(file.size)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                file.uploadType === 'question'
                                  ? isDark ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-600'
                                  : isDark ? 'bg-purple-900/30 text-purple-200' : 'bg-purple-100 text-purple-600'
                              }`}>
                                {file.uploadType === 'question' ? 'Question Paper' : 'Answer Sheet'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file.id, `${selectedUpload.studentInfo?.name || 'student'}_${file.name}`)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            isDark 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                          }`}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowViewUploadModal(false)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } hover:scale-105`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownloadAllFiles(selectedUpload)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download All Files
                  </button>
                  <button
                    onClick={() => handleDownloadReport(selectedUpload)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      isDark 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                    } hover:scale-105 flex items-center`}
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;