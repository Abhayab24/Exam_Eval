// contexts/UploadContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const UploadContext = createContext();

export const useUploads = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUploads must be used within an UploadProvider');
  }
  return context;
};

export const UploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState([]);
  const [teacherUploads, setTeacherUploads] = useState([]);
  const [fileStorage, setFileStorage] = useState({}); // Store actual file data

  // Load uploads from localStorage on init
  useEffect(() => {
    const savedUploads = localStorage.getItem('student_uploads');
    const savedTeacherUploads = localStorage.getItem('teacher_uploads');
    const savedFileStorage = localStorage.getItem('file_storage');
    
    if (savedUploads) {
      setUploads(JSON.parse(savedUploads));
    }
    if (savedTeacherUploads) {
      setTeacherUploads(JSON.parse(savedTeacherUploads));
    }
    if (savedFileStorage) {
      setFileStorage(JSON.parse(savedFileStorage));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('student_uploads', JSON.stringify(uploads));
  }, [uploads]);

  useEffect(() => {
    localStorage.setItem('teacher_uploads', JSON.stringify(teacherUploads));
  }, [teacherUploads]);

  useEffect(() => {
    localStorage.setItem('file_storage', JSON.stringify(fileStorage));
  }, [fileStorage]);

  const addUpload = (uploadData) => {
    const newUpload = {
      ...uploadData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUploads(prev => [newUpload, ...prev]);
  };

  const addTeacherUpload = (uploadData) => {
    const newUpload = {
      ...uploadData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTeacherUploads(prev => [newUpload, ...prev]);
  };

  const storeFile = (fileId, fileData) => {
    setFileStorage(prev => ({
      ...prev,
      [fileId]: fileData
    }));
  };

  const getFile = (fileId) => {
    return fileStorage[fileId];
  };

  const deleteUpload = (id) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const deleteTeacherUpload = (id) => {
    setTeacherUploads(prev => prev.filter(upload => upload.id !== id));
  };

  return (
    <UploadContext.Provider value={{
      uploads,
      teacherUploads,
      fileStorage,
      addUpload,
      addTeacherUpload,
      storeFile,
      getFile,
      deleteUpload,
      deleteTeacherUpload,
    }}>
      {children}
    </UploadContext.Provider>
  );
};