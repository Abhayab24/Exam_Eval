import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  ArrowLeftIcon, 
  ClockIcon, 
  AcademicCapIcon,
  CalendarIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Mock practice tests
const mockPracticeTests = [
  {
    id: 1,
    subject: 'Algorithms',
    title: 'Algorithm Fundamentals',
    description: 'Practice core concepts in algorithm design and analysis.',
    difficulty: 'Medium',
    duration: 30,
    isAssigned: false,
    questionPool: [
      { 
        id: 1, 
        text: 'Explain the concept of time complexity in algorithms with an example.',
        type: 'essay',
        maxScore: 100,
        wordLimit: 200
      },
      { 
        id: 2, 
        text: 'Describe how a binary search algorithm works and its advantages.',
        type: 'essay',
        maxScore: 100,
        wordLimit: 150
      },
    ],
  },
  {
    id: 2,
    subject: 'Data Structures',
    title: 'Data Structures Basics',
    description: 'Explore fundamental data structures and their applications.',
    difficulty: 'Easy',
    duration: 25,
    isAssigned: false,
    questionPool: [
      { 
        id: 1, 
        text: 'Describe the differences between arrays and linked lists.',
        type: 'essay',
        maxScore: 100,
        wordLimit: 150
      },
      { 
        id: 2, 
        text: 'Explain how a binary tree is used in real-world applications.',
        type: 'essay',
        maxScore: 100,
        wordLimit: 200
      },
    ],
  },
  {
    id: 3,
    subject: 'Mathematics',
    title: 'Calculus Basics',
    description: 'Test your understanding of derivatives and integrals.',
    difficulty: 'Hard',
    duration: 45,
    isAssigned: false,
    questionPool: [
      { 
        id: 1, 
        text: 'Explain the fundamental theorem of calculus and its significance.',
        type: 'essay',
        maxScore: 100,
        wordLimit: 250
      },
      { 
        id: 2, 
        text: 'Describe the difference between definite and indefinite integrals.',
        type: 'essay',
        maxScore: 100,
        wordLimit: 150
      },
    ],
  },
];

// Helper function to get test history
const getMockTestHistory = () => {
  try {
    const saved = localStorage.getItem('testHistory');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading test history:', error);
    return {};
  }
};

// Helper function to get assigned tests from teacher's storage
const getAssignedTests = () => {
  try {
    // Get teacher's tests from localStorage
    const teacherTests = JSON.parse(localStorage.getItem('teacherTests') || '[]');
    
    // Filter only tests that are assigned by teachers
    const assignedTeacherTests = teacherTests.filter(test => test.isAssigned);
    
    // Convert to student format
    return assignedTeacherTests.map(test => ({
      id: `assigned-${test.id}`,
      subject: test.subject,
      title: test.title,
      description: test.description || `Assigned by ${test.createdBy}`,
      difficulty: test.difficulty || 'Medium',
      duration: test.duration || 60,
      isAssigned: true,
      type: 'assigned',
      assignedBy: test.createdBy,
      assignedTo: test.assignedTo || ['All Students'], // Default if not specified
      assignedDate: test.assignedDate,
      dueDate: test.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: false, // Track completion per student
      questionPool: test.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: 'essay',
        maxScore: q.marks || 100,
        wordLimit: q.wordLimit || 200
      }))
    }));
  } catch (error) {
    console.error('Error loading assigned tests:', error);
    return [];
  }
};

// Helper function to get student's completed tests
const getStudentCompletedTests = () => {
  try {
    const saved = localStorage.getItem('studentCompletedTests');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading completed tests:', error);
    return {};
  }
};

const StudentDashboard = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState(null);
  const [testHistory, setTestHistory] = useState(getMockTestHistory());
  const [assignedTests, setAssignedTests] = useState(getAssignedTests());
  const [completedTests, setCompletedTests] = useState(getStudentCompletedTests());
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'practice'
  const [stats, setStats] = useState({
    totalTestsTaken: 0,
    averageScore: 0,
    bestSubject: 'None',
    completedAssignedTests: 0,
    pendingTests: 0
  });

  // Listen for new assigned tests (simulating real-time updates)
  useEffect(() => {
    const handleStorageChange = () => {
      setAssignedTests(getAssignedTests());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      setAssignedTests(getAssignedTests());
      setCompletedTests(getStudentCompletedTests());
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate statistics
  useEffect(() => {
    const history = Object.values(testHistory);
    const assigned = assignedTests;
    const completed = completedTests;
    
    const totalTests = history.length;
    const totalScore = history.reduce((sum, test) => sum + test.score, 0);
    const averageScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
    
    // Find best subject
    const subjectScores = {};
    history.forEach(test => {
      if (!subjectScores[test.subject]) {
        subjectScores[test.subject] = { total: 0, count: 0 };
      }
      subjectScores[test.subject].total += test.score;
      subjectScores[test.subject].count++;
    });

    let bestSubject = 'None';
    let bestAverage = 0;
    Object.entries(subjectScores).forEach(([subject, data]) => {
      const average = data.total / data.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestSubject = subject;
      }
    });

    // Calculate assigned test stats
    const completedAssigned = assigned.filter(test => 
      completed[test.id] || false
    ).length;
    const pendingTests = assigned.length - completedAssigned;

    setStats({
      totalTestsTaken: totalTests,
      averageScore,
      bestSubject,
      completedAssignedTests: completedAssigned,
      pendingTests
    });
  }, [testHistory, assignedTests, completedTests]);

  // Combine practice and assigned tests with completion status
  const getAllTests = () => {
    const practiceWithFlag = mockPracticeTests.map(test => ({
      ...test,
      isAssigned: false,
      type: 'practice'
    }));
    
    const assignedWithFlag = assignedTests.map(test => ({
      ...test,
      isCompleted: completedTests[test.id] || false
    }));

    return [...assignedWithFlag, ...practiceWithFlag];
  };

  const getFilteredTests = () => {
    const allTests = getAllTests();
    switch (activeTab) {
      case 'assigned':
        return allTests.filter(test => test.isAssigned && !test.isCompleted);
      case 'completed':
        return allTests.filter(test => test.isAssigned && test.isCompleted);
      case 'practice':
        return allTests.filter(test => !test.isAssigned);
      default:
        return allTests;
    }
  };

  const getRandomQuestions = (questionPool, count = 2) => {
    return [...questionPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  };

  const handleTestSelect = (test) => {
    if (test.isAssigned && test.isCompleted) {
      alert('You have already completed this assigned test.');
      return;
    }

    const selectedQuestions = test.isAssigned ? 
      test.questionPool : // Show all questions for assigned tests
      getRandomQuestions(test.questionPool, 2); // Random questions for practice tests
    
    setSelectedTest({ 
      ...test, 
      questions: selectedQuestions,
      startedAt: new Date().toISOString(),
    });
    setAnswers({});
    setResults(null);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: {
        text: value,
        timestamp: new Date().toISOString(),
        wordCount: value.trim().split(/\s+/).length
      }
    }));
  };

  const generateAIEvaluation = (test, answers) => {
    const evaluation = {};
    let totalScore = 0;
    let totalPossible = 0;

    test.questions.forEach((question) => {
      const answer = answers[question.id];
      let score = 0;
      let feedback = '';
      let strengths = [];
      let improvements = [];

      if (!answer || !answer.text.trim()) {
        score = 0;
        feedback = 'No answer provided. Please submit a response to receive a score.';
        strengths = [];
        improvements = ['Provide a complete answer to the question'];
      } else {
        // Simulate AI evaluation based on answer characteristics
        const answerData = answer.text;
        const wordCount = answerData.trim().split(/\s+/).length;
        const wordLimit = question.wordLimit || 200;
        
        // Base score from word count (up to 60 points)
        const wordScore = Math.min(60, Math.floor((wordCount / wordLimit) * 60));
        
        // Random quality score (40 points)
        const qualityScore = Math.floor(Math.random() * 40);
        
        score = Math.min(100, wordScore + qualityScore);
        
        // Generate feedback based on score
        if (score >= 80) {
          feedback = 'Excellent response! Comprehensive and well-structured.';
          strengths = ['Clear explanation', 'Good examples provided', 'Well-organized thoughts'];
          improvements = ['Consider adding more real-world applications'];
        } else if (score >= 60) {
          feedback = 'Good attempt. Covers the main points but could use more detail.';
          strengths = ['Correct concepts identified', 'Relevant points mentioned'];
          improvements = ['Add more specific examples', 'Expand on key concepts'];
        } else if (score >= 40) {
          feedback = 'Basic understanding shown. Needs more depth and clarity.';
          strengths = ['Attempted to address the question'];
          improvements = ['Provide more detailed explanations', 'Include specific examples', 'Structure your answer better'];
        } else {
          feedback = 'Needs significant improvement. Please review the topic.';
          strengths = [];
          improvements = ['Study the fundamental concepts', 'Practice with simpler questions first', 'Focus on understanding before writing'];
        }
      }

      totalScore += score;
      totalPossible += question.maxScore;
      
      evaluation[question.id] = { 
        score, 
        feedback, 
        strengths, 
        improvements,
        maxScore: question.maxScore
      };
    });

    const finalScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    
    return {
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      score: finalScore,
      evaluation,
      completedAt: new Date().toISOString(),
      timeSpent: Math.floor(Math.random() * 20) + 10,
      isAssignedTest: test.isAssigned || false
    };
  };

  const handleSubmit = async () => {
    if (!selectedTest || Object.keys(answers).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    if (selectedTest.isAssigned && Object.keys(answers).length < selectedTest.questions.length) {
      if (!window.confirm('You have not answered all questions. Are you sure you want to submit?')) {
        return;
      }
    }

    setIsEvaluating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const evaluationResult = generateAIEvaluation(selectedTest, answers);
    setResults(evaluationResult);
    
    // Save to history
    const newHistory = {
      ...testHistory,
      [Date.now()]: evaluationResult,
    };
    setTestHistory(newHistory);
    localStorage.setItem('testHistory', JSON.stringify(newHistory));
    
    // If it's an assigned test, mark it as completed
    if (selectedTest.isAssigned) {
      const updatedCompletedTests = {
        ...completedTests,
        [selectedTest.id]: true
      };
      setCompletedTests(updatedCompletedTests);
      localStorage.setItem('studentCompletedTests', JSON.stringify(updatedCompletedTests));
    }
    
    setIsEvaluating(false);
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
    setAnswers({});
    setResults(null);
  };

  const renderTestCard = (test) => (
    <div
      key={test.id}
      className={`p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
        isDark 
          ? 'bg-gray-800 hover:bg-gray-750 border-gray-700' 
          : 'bg-white hover:bg-gray-50 border-gray-200'
      } border shadow-sm`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-2">
          {test.isAssigned ? (
            <>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Assigned
              </span>
              {test.isCompleted && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Completed
                </span>
              )}
            </>
          ) : (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              test.difficulty === 'Easy' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : test.difficulty === 'Medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {test.difficulty}
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          {test.duration} min
        </div>
      </div>
      
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {test.title}
      </h3>
      <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {test.subject}
      </p>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {test.description}
      </p>
      
      {test.isAssigned && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
            <UserIcon className="h-4 w-4 mr-2" />
            <span>Assigned by: {test.assignedBy}</span>
          </div>
          {test.dueDate && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>Due: {new Date(test.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {test.questionPool.length} questions
        </span>
        <button
          onClick={() => handleTestSelect(test)}
          disabled={test.isAssigned && test.isCompleted}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            test.isAssigned && test.isCompleted
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          {test.isAssigned && test.isCompleted ? 'Completed' : test.isAssigned ? 'Take Test' : 'Start Test'}
        </button>
      </div>
    </div>
  );

  const renderQuestion = (question) => (
    <div key={question.id} className="mb-8">
      <div className="flex justify-between items-start mb-3">
        <div>
          <label className={`block font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Question {question.id}
          </label>
          {question.wordLimit && (
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Word limit: {question.wordLimit} words
            </p>
          )}
        </div>
        <span className={`text-sm px-2 py-1 rounded ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          Essay Question
        </span>
      </div>
      <p className={`mb-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {question.text}
      </p>
      <textarea
        value={answers[question.id]?.text || ''}
        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
        className={`w-full p-4 rounded-lg transition-all duration-200 ${
          isDark 
            ? 'bg-gray-900 text-white border-gray-700 focus:border-blue-500' 
            : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
        } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        rows="6"
        placeholder="Type your detailed answer here..."
      />
      <div className="flex justify-between items-center mt-2">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Word count: {answers[question.id]?.wordCount || 0}
        </span>
        {question.wordLimit && (
          <span className={`text-sm ${
            (answers[question.id]?.wordCount || 0) > question.wordLimit 
              ? 'text-red-600 dark:text-red-400' 
              : isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Limit: {question.wordLimit} words
          </span>
        )}
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border border-blue-200 dark:border-blue-900`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Test Results
            </h3>
            {selectedTest.isAssigned && (
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                This test was assigned by your teacher
              </p>
            )}
          </div>
          <span className={`text-2xl font-bold ${
            results.score >= 80 ? 'text-green-600 dark:text-green-400' :
            results.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {results.score}%
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Subject</p>
            <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{results.subject}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time Spent</p>
            <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{results.timeSpent} min</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date Completed</p>
            <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {new Date(results.completedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {selectedTest.questions.map((question) => {
          const evalData = results.evaluation[question.id];
          return (
            <div key={question.id} className={`mb-6 p-6 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-sm`}>
              <div className="flex justify-between items-center mb-3">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {question.text}
                </p>
                <span className={`text-xl font-bold ${
                  evalData.score >= 80 ? 'text-green-600 dark:text-green-400' :
                  evalData.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {evalData.score}%
                </span>
              </div>
              
              <div className="mb-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Your Answer:
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} p-3 rounded bg-gray-800 dark:bg-gray-950`}>
                  {answers[question.id]?.text || 'No answer provided'}
                </p>
              </div>
              
              <div className="mb-4">
                <p className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                  Feedback:
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {evalData.feedback}
                </p>
              </div>
              
              {evalData.strengths.length > 0 && (
                <div className="mb-3">
                  <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'} mb-1`}>
                    Strengths:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {evalData.strengths.map((strength, idx) => (
                      <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {evalData.improvements.length > 0 && (
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'} mb-1`}>
                    Areas for Improvement:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {evalData.improvements.map((improvement, idx) => (
                      <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex gap-4">
          <button
            onClick={handleBackToTests}
            className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Tests
          </button>
          {!selectedTest.isAssigned && (
            <button
              onClick={() => handleTestSelect(selectedTest)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Retake Test
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const filteredTests = getFilteredTests();

  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Welcome back, {currentUser?.name || 'Student'}!
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Practice makes perfect. Take a test to improve your skills.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900' : 'bg-blue-100'} mr-4`}>
                <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Tests Taken</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalTestsTaken}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-100'} mr-4`}>
                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.averageScore}%
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900' : 'bg-purple-100'} mr-4`}>
                <BookOpenIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Tests</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pendingTests}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900' : 'bg-orange-100'} mr-4`}>
                <CheckCircleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Best Subject</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.bestSubject}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!selectedTest ? (
          <div>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Tests
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'assigned'
                    ? 'bg-purple-600 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Assigned Tests
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-green-600 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'practice'
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Practice Tests
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'assigned' ? 'Assigned Tests' : 
                 activeTab === 'completed' ? 'Completed Tests' :
                 activeTab === 'practice' ? 'Practice Tests' : 'All Tests'} 
                ({filteredTests.length})
              </h2>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.pendingTests} pending assigned tests
              </span>
            </div>
            
            {filteredTests.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className={`text-lg mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeTab === 'assigned' ? 'No assigned tests yet' : 
                   activeTab === 'completed' ? 'No completed tests' :
                   activeTab === 'practice' ? 'No practice tests available' : 'No tests available'}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {activeTab === 'assigned' ? 'Your teacher will assign tests here' : 
                   activeTab === 'practice' ? 'Practice tests will appear here' : 
                   'Start by taking a test'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(renderTestCard)}
              </div>
            )}
          </div>
        ) : (
          <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 md:p-8`}>
            {/* Test Header */}
            <div className="mb-8">
              <button
                onClick={handleBackToTests}
                className={`flex items-center mb-4 text-sm font-medium ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } transition-colors`}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to all tests
              </button>
              
              <div className="flex justify-between items-start">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {selectedTest.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {selectedTest.subject}
                    </span>
                    {selectedTest.isAssigned ? (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                      }`}>
                        Assigned Test
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTest.difficulty === 'Easy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : selectedTest.difficulty === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {selectedTest.difficulty}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedTest.questions.length} questions
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {selectedTest.duration} mins
                    </span>
                  </div>
                  {selectedTest.isAssigned && selectedTest.assignedBy && (
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Assigned by: {selectedTest.assignedBy}
                    </p>
                  )}
                </div>
                
                {!results && (
                  <div className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <ClockIcon className="h-5 w-5 inline mr-2" />
                    Started at {new Date(selectedTest.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>

            {/* Test Content */}
            {!results ? (
              <div>
                <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    📝 Instructions
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedTest.isAssigned 
                      ? 'This is an assigned test. Answer all questions thoroughly. Your teacher will be able to see your responses.'
                      : 'Answer all questions in detail. Your responses will be evaluated based on content, clarity, and depth.'}
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Aim for comprehensive answers with clear explanations and examples.
                  </p>
                </div>

                {selectedTest.questions.map(renderQuestion)}

                <div className="sticky bottom-0 pt-6 mt-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Questions answered: {Object.keys(answers).length} of {selectedTest.questions.length}
                      </p>
                      {selectedTest.isAssigned && (
                        <p className={`text-xs mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          ⚠️ This test will be submitted to your teacher
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={isEvaluating}
                      className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                        isEvaluating
                          ? 'opacity-50 cursor-not-allowed bg-blue-500'
                          : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      } text-white`}
                    >
                      {isEvaluating ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Evaluating with AI...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          {selectedTest.isAssigned ? 'Submit to Teacher' : 'Submit for AI Evaluation'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              renderResults()
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;