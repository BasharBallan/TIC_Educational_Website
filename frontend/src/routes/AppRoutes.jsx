import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

import MainPage from "../pages/MainPage";
import Profile from "../pages/Profile";
import ProfileUpdate from "../pages/ProfileUpdate";
import ChangePassword from "../pages/ChangePassword";
import Subjects from "../pages/Subjects";
import Lectures from "../pages/Lectures";
import Favorites from "../pages/Favorites";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Routes (Student + Doctor) */}
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile-update"
        element={
          <ProtectedRoute>
            <ProfileUpdate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/updateMyPassword"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Student Only Routes */}
      <Route
        path="/subjects"
        element={
          <RoleRoute allowedRoles={["student"]}>
            <Subjects />
          </RoleRoute>
        }
      />

      <Route
        path="/lectures/:subjectId"
        element={
          <RoleRoute allowedRoles={["student"]}>
            <Lectures />
          </RoleRoute>
        }
      />

      <Route
        path="/favorites"
        element={
          <RoleRoute allowedRoles={["student"]}>
            <Favorites />
          </RoleRoute>
        }
      />

      {/* Doctor Only Routes (Future) */}
      <Route
        path="/doctor-dashboard"
        element={
          <RoleRoute allowedRoles={["doctor"]}>
            <h1>Doctor Dashboard</h1>
          </RoleRoute>
        }
      />

      {/* Admin Only Routes (Future) */}
      <Route
        path="/admin-dashboard"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <h1>Admin Dashboard</h1>
          </RoleRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
