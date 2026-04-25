import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./screens/Home";
import Dashboard from "./screens/Dashboard";
import RegisterComplaint from "./screens/RegisterComplaint";
import TrackComplaint from "./screens/TrackComplaint";
import AdminDashboard from "./screens/AdminDashboard";
import Helpline from "./screens/Helpline";
import Login from "./screens/login";
import MyComplaints from "./screens/MyComplaints";



const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <main className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={
              <ProtectedRoute>
                <RegisterComplaint />
              </ProtectedRoute>
            } />
            <Route path="/track/:id" element={
              <ProtectedRoute>
                <TrackComplaint />
              </ProtectedRoute>
            } />
            <Route path="/helpline" element={
              <ProtectedRoute>
                <Helpline />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-complaints" element={
              <ProtectedRoute>
                <MyComplaints />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;