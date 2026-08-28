import { Routes, Route, Navigate } from "react-router-dom";

// =======================
// Auth & Signup Pages
// =======================
import Landing from "../features/auth/pages/Landing";
import Login from "../features/auth/pages/Login";

// Signup Flow
import Step1BasicInfo from "../features/auth/pages/signup/Step1BasicInfo";
import Step2VerifyEmail from "../features/auth/pages/signup/Step2VerifyEmail";
import Step3CompleteProfile from "../features/auth/pages/signup/Step3CompleteProfile";
import Step4PendingApproval from "../features/auth/pages/signup/Step4PendingApproval";
import Step5Rejected from "../features/auth/pages/signup/Step5Rejected";

// =======================
// Student Pages
// =======================
import MainPage from "../features/auth/pages/MainPage";
import Subjects from "../features/student/pages/Subjects";
import Lectures from "../features/student/pages/Lectures";
import Favorites from "../features/student/pages/Favorites";
import NotificationsPage from "../features/student/pages/NotificationsPage";
import NotificationSettings from "../features/student/pages/NotificationSettings";
import SubjectLectures from "../features/student/pages/SubjectLectures";

// =======================
// Profile Pages
// =======================
import Profile from "../features/profile/pages/Profile";
import ProfileUpdate from "../features/profile/pages/ProfileUpdate";
import ChangePassword from "../features/profile/pages/ChangePassword";

// =======================
// Doctor Pages
// =======================
import AddLecture from "../features/doctor/pages/AddLecture";

// =======================
// Admin Pages
// =======================

// =======================
// Route Guards
// =======================
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Signup Flow */}
      <Route path="/auth/signup/basic-info" element={<Step1BasicInfo />} />
      <Route path="/auth/signup/verify-email" element={<Step2VerifyEmail />} />
      <Route path="/auth/signup/complete-profile" element={<Step3CompleteProfile />} />
      <Route path="/auth/signup/pending-approval" element={<Step4PendingApproval />} />
      <Route path="/auth/signup/rejected" element={<Step5Rejected />} />

      {/* Authenticated Routes */}
      <Route
        path="/mainpage"
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
        path="/profile/update"
        element={
          <ProtectedRoute>
            <ProfileUpdate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Notification Settings */}
      <Route
        path="/settings/notifications"
        element={
          <ProtectedRoute>
            <NotificationSettings />
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
            <SubjectLectures />
          </RoleRoute>
        }
      />

      <Route
        path="/lectures"
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

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Doctor Only Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <RoleRoute allowedRoles={["doctor"]}>
            <h1>Doctor Dashboard</h1>
          </RoleRoute>
        }
      />

      <Route
        path="/addLecture"
        element={
          <RoleRoute allowedRoles={["doctor"]}>
            <AddLecture />
          </RoleRoute>
        }
      />

      {/* Admin Only Routes */}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
