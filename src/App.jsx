import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Reflections from "./pages/Reflections";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Learning from "./pages/Learning";
import Skills from "./pages/Skills";
import Messages from "./pages/Messages";
import Feedback from "./pages/Feedback";  
import Admin from "./pages/Admin";  
import Supervisor from "./pages/Supervisor"; 
import TestTaking from "./pages/TestTaking";


function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* ================= APP ROUTES ================= */
function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          }
        />

        <Route
          path="/learning"
          element={
            <PrivateRoute allowedRoles={["learner", "candidate"]}>
              <Learning />
            </PrivateRoute>
          }
        />

        <Route
          path="/skills"
          element={
            <PrivateRoute allowedRoles={["learner", "candidate"]}>
              <Skills />
            </PrivateRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
  path="/reflections"
  element={
    <PrivateRoute allowedRoles={["learner", "candidate"]}>
      <Reflections />
    </PrivateRoute>
  }
/>

        {/* ✅ ADDED FEEDBACK ROUTE */}
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />

        <Route path="/test/:testId" element={<PrivateRoute><TestTaking /></PrivateRoute>} />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Admin />
            </PrivateRoute>
          }
        />

        <Route
          path="/supervisor"
          element={
            <PrivateRoute allowedRoles={["supervisor", "admin"]}>
              <Supervisor />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

/* ================= ROOT ================= */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}