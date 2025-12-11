import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useUploads } from '../contexts/UploadContext';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CpuChipIcon,
  AcademicCapIcon,
  StarIcon,
  UserIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  DocumentChartBarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Upload = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { addUpload, storeFile } = useUploads();
  
  const [uploadType, setUploadType] = useState('question');
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  // Student information state
  const [showStudentInfoModal, setShowStudentInfoModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    class: '',
    subject: ''
  });

  // Show student info modal when component mounts
  useEffect(() => {
    const hasShownModal = localStorage.getItem('hasShownStudentInfoModal');
    if (!hasShownModal) {
      setShowStudentInfoModal(true);
      localStorage.setItem('hasShownStudentInfoModal', 'true');
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles) => {
    // Check file sizes (max 10MB)
    const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length !== newFiles.length) {
      alert('Some files exceed 10MB limit and were not added.');
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStudentInfoSubmit = (e) => {
    e.preventDefault();
    if (studentInfo.name && studentInfo.class && studentInfo.subject) {
      setShowStudentInfoModal(false);
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleStudentInfoChange = (field, value) => {
    setStudentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const simulateFileProcessing = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          processed: true
        });
      }, Math.random() * 1000 + 500);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    setShowResult(false);
    setUploadComplete(false);

    // Process files and store them
    const processedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Convert file to base64 for storage
      try {
        const fileData = await convertFileToBase64(file);
        
        // Generate unique file ID
        const fileId = `file_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store file in context
        storeFile(fileId, {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileData,
          uploadType: uploadType,
          uploadedAt: new Date().toISOString(),
          studentName: studentInfo.name,
          studentClass: studentInfo.class,
          subject: studentInfo.subject
        });
        
        processedFiles.push({
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadType: uploadType
        });
      } catch (error) {
        console.error('Error processing file:', error);
      }
      
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    // Save upload data to context
    const uploadData = {
      studentInfo,
      files: processedFiles, // Store file references with IDs
      result: currentResult,
      uploadedBy: user?.email || 'Anonymous',
      uploadedAt: new Date().toISOString(),
      fileIds: processedFiles.map(f => f.id) // Store file IDs for reference
    };

    addUpload(uploadData);

    setUploading(false);
    setUploadComplete(true);
    
    // Start AI analysis
    setTimeout(() => {
      setIsAnalyzing(true);
      
      // Show result after analysis (shorter time for demo)
      setTimeout(() => {
        const sampleResults = [
          {
            totalMarks: 85,
            maxMarks: 100,
            grade: "A",
            feedback: "Excellent understanding of core concepts. Strong analytical skills demonstrated throughout.",
            strengths: ["Clear explanations", "Good use of examples", "Logical structure"],
            improvements: ["Could expand on theoretical foundations"]
          },
          {
            totalMarks: 92,
            maxMarks: 100,
            grade: "A+",
            feedback: "Outstanding performance with comprehensive answers and innovative thinking.",
            strengths: ["Exceptional depth", "Creative problem-solving", "Perfect formatting"],
            improvements: ["Minor grammatical errors"]
          },
          {
            totalMarks: 78,
            maxMarks: 100,
            grade: "B+",
            feedback: "Good grasp of fundamentals with room for deeper analysis in complex topics.",
            strengths: ["Clear methodology", "Good examples", "Neat presentation"],
            improvements: ["Need more detailed explanations", "Could improve time management"]
          }
        ];
        
        const randomResult = sampleResults[Math.floor(Math.random() * sampleResults.length)];
        setCurrentResult({
          ...randomResult,
          studentName: studentInfo.name,
          studentClass: studentInfo.class,
          subject: studentInfo.subject
        });
        setIsAnalyzing(false);
        setShowResult(true);
      }, 3000); // 3 seconds for demo
    }, 1000);
  };

  const closeResult = () => {
    setShowResult(false);
    setCurrentResult(null);
    setFiles([]);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <DocumentTextIcon className="h-8 w-8 text-blue-600" />;
    }
    return <DocumentTextIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-500';
    if (grade === 'B+' || grade === 'B') return 'text-blue-500';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-500';
    if (grade === 'D+' || grade === 'D') return 'text-orange-500';
    return 'text-red-500'; 
  };

  // Function to download files directly from the upload component (for testing)
  const downloadCurrentFiles = async () => {
    if (files.length === 0) return;
    
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-blue-50'} relative`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with animated gradient */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mr-4`}>
              <CloudArrowUpIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'}`}>
                Upload Exam Materials
              </h1>
              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
                Upload question papers, model answers, or student responses for AI evaluation
              </p>
            </div>
          </div>
          
          {/* Student info card */}
          {studentInfo.name && (
            <div className={`mt-6 p-5 rounded-xl backdrop-blur-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-blue-100'} border shadow-lg`}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-100'} mr-3`}>
                    <UserIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {studentInfo.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-100'} mr-3`}>
                    <BuildingLibraryIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {studentInfo.class}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-100'} mr-3`}>
                    <BookOpenIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subject</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {studentInfo.subject}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowStudentInfoModal(true)}
                  className={`ml-auto px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} hover:scale-105`}
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Options and File List */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Type Selection */}
            <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
              <h2 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <DocumentChartBarIcon className="h-6 w-6 mr-3 text-blue-500" />
                What are you uploading?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setUploadType('question')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left transform hover:-translate-y-1 hover:shadow-lg ${
                    uploadType === 'question'
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg'
                      : isDark 
                        ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <DocumentTextIcon className={`h-10 w-10 mb-4 ${uploadType === 'question' ? 'text-blue-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`font-bold text-lg ${uploadType === 'question' ? 'text-blue-600' : isDark ? 'text-white' : 'text-gray-900'}`}>
                    Question Papers & Model Answers
                  </h3>
                  <p className={`text-sm mt-2 ${uploadType === 'question' ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload question papers with their corresponding model answers and evaluation rubrics
                  </p>
                </button>
                
                <button
                  onClick={() => setUploadType('answer')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left transform hover:-translate-y-1 hover:shadow-lg ${
                    uploadType === 'answer'
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg'
                      : isDark 
                        ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <PhotoIcon className={`h-10 w-10 mb-4 ${uploadType === 'answer' ? 'text-blue-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`font-bold text-lg ${uploadType === 'answer' ? 'text-blue-600' : isDark ? 'text-white' : 'text-gray-900'}`}>
                    Student Answer Sheets
                  </h3>
                  <p className={`text-sm mt-2 ${uploadType === 'answer' ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload student answer sheets (handwritten or typed) for AI evaluation
                  </p>
                </button>
              </div>
            </div>

            {/* Upload Area */}
            <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragOver
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-inner'
                    : isDark
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CloudArrowUpIcon className={`mx-auto h-16 w-16 ${dragOver ? 'text-blue-500 scale-110' : isDark ? 'text-gray-400' : 'text-gray-400'} mb-4 transition-transform duration-300`} />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Drop files here or click to upload
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Supports PDF, DOC, DOCX, JPG, PNG, and JPEG files up to 10MB each
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  Select Files
                </label>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <DocumentTextIcon className="h-6 w-6 mr-3 text-blue-500" />
                    Selected Files ({files.length})
                  </h3>
                  <button
                    onClick={downloadCurrentFiles}
                    disabled={files.length === 0}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-500'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-600 disabled:bg-gray-200 disabled:text-gray-400'
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download All
                  </button>
                </div>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                        isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-50 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          {getFileIcon(file)}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>
                        <div className="ml-4">
                          <p className={`font-semibold truncate max-w-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {file.name}
                          </p>
                          <div className="flex items-center text-sm">
                            <span className={`mr-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatFileSize(file.size)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const url = URL.createObjectURL(file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                            isDark ? 'hover:bg-blue-900/30 text-blue-400' : 'hover:bg-blue-100 text-blue-600'
                          }`}
                          title="Download this file"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removeFile(index)}
                          className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${
                            isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-red-50 text-gray-500'
                          }`}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm animate-pulse`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CloudArrowUpIcon className="h-6 w-6 text-blue-500 mr-3 animate-bounce" />
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Uploading files...
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {uploadProgress}%
                  </span>
                </div>
                <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden`}>
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className={`text-sm mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Processing {files.length} file{files.length > 1 ? 's' : ''}...
                </p>
              </div>
            )}

            {/* AI Analysis */}
            {isAnalyzing && (
              <div className={`rounded-2xl shadow-xl p-8 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <CpuChipIcon className="h-16 w-16 text-blue-500 animate-spin-slow" />
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      AI Analysis in Progress
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                      Our AI is evaluating handwriting, checking answers, and calculating scores
                    </p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Complete */}
            {uploadComplete && !uploading && !isAnalyzing && !showResult && (
              <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-500" />
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Upload Complete!
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your files have been uploaded successfully and saved to teacher dashboard.
                    </p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Files are now available for teachers to download
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats and Actions */}
          <div className="space-y-8">
            {/* Upload Stats */}
            <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <ChartBarIcon className="h-6 w-6 mr-3 text-blue-500" />
                Upload Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Files Selected</span>
                  <span className={`font-bold ${files.length > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                    {files.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Size</span>
                  <span className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Upload Type</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    uploadType === 'question' 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {uploadType === 'question' ? 'Question Paper' : 'Answer Sheet'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    uploading ? 'bg-yellow-100 text-yellow-600' :
                    isAnalyzing ? 'bg-purple-100 text-purple-600' :
                    files.length === 0 ? 'bg-gray-100 text-gray-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {uploading ? 'Uploading' : isAnalyzing ? 'Analyzing' : files.length === 0 ? 'Ready' : 'Ready to Upload'}
                  </span>
                </div>
              </div>
              
              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading || isAnalyzing || !studentInfo.name}
                className={`w-full mt-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                  files.length === 0 || uploading || isAnalyzing || !studentInfo.name
                    ? isDark 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Uploading...
                  </div>
                ) : isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <CpuChipIcon className="h-5 w-5 mr-3 animate-pulse" />
                    Analyzing...
                  </div>
                ) : (
                  `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`
                )}
              </button>
              
              {!studentInfo.name && (
                <p className={`text-sm text-center mt-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Please fill student information first
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <ClockIcon className="h-6 w-6 mr-3 text-blue-500" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowStudentInfoModal(true)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-50 hover:bg-blue-50 text-gray-900'
                  } hover:scale-[1.02]`}
                >
                  <span className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-3 text-blue-500" />
                    Edit Student Info
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    Required
                  </span>
                </button>
                
                <button
                  onClick={() => setFiles([])}
                  disabled={files.length === 0}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                    files.length === 0
                      ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                      : isDark 
                        ? 'bg-gray-700 hover:bg-red-900/30 text-red-400' 
                        : 'bg-gray-50 hover:bg-red-50 text-red-600'
                  } hover:scale-[1.02]`}
                >
                  <XMarkIcon className="h-5 w-5 mr-3" />
                  Clear All Files
                </button>
                
                <button
                  onClick={() => document.getElementById('file-upload').click()}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-50 hover:bg-blue-50 text-gray-900'
                  } hover:scale-[1.02]`}
                >
                  <CloudArrowUpIcon className="h-5 w-5 mr-3 text-blue-500" />
                  Add More Files
                </button>
              </div>
            </div>

            {/* Guidelines */}
            <div className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <AcademicCapIcon className="h-6 w-6 mr-3 text-blue-500" />
                Guidelines
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className={`font-bold text-sm mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    For Question Papers:
                  </h4>
                  <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                      Include clear question numbers
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                      Provide detailed model answers
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                      Add evaluation rubrics
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className={`font-bold text-sm mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    For Answer Sheets:
                  </h4>
                  <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                      Ensure clear handwriting
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                      Include student details
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                      High resolution (300 DPI)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Information Modal */}
      {showStudentInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full animate-slide-up`}>
            <form onSubmit={handleStudentInfoSubmit} className="p-6">
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-blue-100'} mr-4`}>
                  <UserIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Student Information
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Required for evaluation and reporting
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {['name', 'class', 'subject'].map((field) => (
                  <div key={field}>
                    <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {field === 'name' ? 'Student Name *' : 
                       field === 'class' ? 'Class/Grade *' : 
                       'Subject *'}
                    </label>
                    <input
                      type="text"
                      value={studentInfo[field]}
                      onChange={(e) => handleStudentInfoChange(field, e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      }`}
                      placeholder={
                        field === 'name' ? "Enter student's full name" :
                        field === 'class' ? "e.g., 10th Grade, Class XII" :
                        "e.g., Mathematics, Physics"
                      }
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowStudentInfoModal(false)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } hover:scale-105`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Result Modal */}
      {showResult && currentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up`}>
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-blue-100'} mr-4`}>
                    <AcademicCapIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      AI Evaluation Complete
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Detailed analysis and feedback
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeResult}
                  className={`p-3 rounded-full hover:scale-110 transition-all duration-200 ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Student Information Header */}
              <div className={`${isDark ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-2xl p-8 mb-8 shadow-lg`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white/80'} mr-4`}>
                      <UserIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>Student</p>
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentResult.studentName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white/80'} mr-4`}>
                      <BuildingLibraryIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>Class</p>
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentResult.studentClass}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white/80'} mr-4`}>
                      <BookOpenIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>Subject</p>
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentResult.subject}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score Display */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <StarIcon className={`h-12 w-12 ${getGradeColor(currentResult.grade)}`} />
                      <div className={`absolute inset-0 ${getGradeColor(currentResult.grade).replace('text-', 'bg-')} opacity-20 blur-xl rounded-full`}></div>
                    </div>
                    <div className="ml-4">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Grade</p>
                      <p className={`text-4xl font-bold ${getGradeColor(currentResult.grade)}`}>
                        {currentResult.grade}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentResult.totalMarks}
                      <span className={`text-2xl font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        /{currentResult.maxMarks}
                      </span>
                    </p>
                    <div className="flex items-center justify-end mt-2">
                      <div className={`w-48 h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                        <div 
                          className={`h-3 rounded-full bg-gradient-to-r ${getGradeColor(currentResult.grade).replace('text-', 'from-')} ${getGradeColor(currentResult.grade).replace('text-', 'to-').replace('500', '400')}`}
                          style={{ width: `${(currentResult.totalMarks / currentResult.maxMarks) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`ml-3 font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {Math.round((currentResult.totalMarks / currentResult.maxMarks) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="mb-8">
                <h4 className={`font-bold text-lg mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-100'} mr-3`}>
                    <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  AI Feedback Summary
                </h4>
                <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-6`}>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-lg`}>
                    {currentResult.feedback}
                  </p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className={`font-bold text-lg mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-100'} mr-3`}>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    Strengths
                  </h4>
                  <div className={`${isDark ? 'bg-gray-900' : 'bg-green-50/50'} rounded-xl p-6`}>
                    <ul className="space-y-3">
                      {currentResult.strengths.map((strength, index) => (
                        <li key={index} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-bold text-lg mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-100'} mr-3`}>
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                    Areas for Improvement
                  </h4>
                  <div className={`${isDark ? 'bg-gray-900' : 'bg-yellow-50/50'} rounded-xl p-6`}>
                    <ul className="space-y-3">
                      {currentResult.improvements.map((improvement, index) => (
                        <li key={index} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            </div>
                          </div>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm">
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This evaluation has been saved and is available in the Teacher Dashboard.
                  </p>
                  <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-xs mt-1`}>
                    Uploaded: {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closeResult}
                    className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } hover:scale-105`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Create and download evaluation report
                      const report = {
                        studentInfo: studentInfo,
                        evaluation: currentResult,
                        files: files.map(f => ({
                          name: f.name,
                          type: f.type,
                          size: f.size
                        })),
                        uploadedAt: new Date().toISOString()
                      };
                      
                      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `evaluation-report-${studentInfo.name}-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;