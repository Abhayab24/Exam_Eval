// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Backend API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔗 Using API URL:", API_URL);
    const user = localStorage.getItem("examEvalUser");
    if (user && user !== "undefined") {
      try {
        setCurrentUser(JSON.parse(user));
      } catch {
        localStorage.removeItem("examEvalUser");
      }
    }
    setLoading(false);
  }, []);

  // -------------------- REGISTER --------------------
  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name, email, password, role
      });

      const user = res.data.data;
      localStorage.setItem("examEvalUser", JSON.stringify(user));
      localStorage.setItem("examEvalToken", res.data.token);
      setCurrentUser(user);

      return user;
    } catch (error) {
      alert(error.response?.data?.error || "Registration failed");
      return null;
    }
  };

  // -------------------- LOGIN (FIXED) --------------------
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });

      const user = res.data.data;  // <-- Correct (backend returns { data: user })
      localStorage.setItem("examEvalUser", JSON.stringify(user));
      localStorage.setItem("examEvalToken", res.data.token);
      setCurrentUser(user);

      return user; // returns user object → navigation works
    } catch (error) {
      alert(error.response?.data?.error || "Login failed");
      throw error;
    }
  };

  // -------------------- LOGOUT --------------------
  const logout = () => {
    localStorage.removeItem("examEvalUser");
    localStorage.removeItem("examEvalToken");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
