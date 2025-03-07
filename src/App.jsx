import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import Holidays from "./pages/Holidays";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout with Nested Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="/dashboard/home" />} /> {/* 👈 Default Route */}
          <Route path="home" element={<Home />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="holidays" element={<Holidays />} />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
