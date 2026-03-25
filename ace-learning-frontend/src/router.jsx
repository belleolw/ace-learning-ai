import { createBrowserRouter, Navigate } from "react-router-dom";

// Import page components
import LoginPage from "./pages/LoginPage";

import StudentDashboard from "./pages/student/StudentDashboard"
import StudentPractice from "./pages/student/StudentPractice"
import AlgebraDrillSet from "./pages/student/AlgebraDrillSet"
import StudentStudyPlan from "./pages/student/StudentStudyPlan"
import StudentProgress from "./pages/student/StudentProgress"
import StudentWellness from "./pages/student/StudentWellness"

import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildProgressPage from "./pages/parent/ParentChildProgressPage";
import ParentWeakTopicsPage from "./pages/parent/ParentWeakTopicsPage";
import ParentRecommendationsPage from "./pages/parent/ParentRecommendationsPage";
import ParentWellness from "./pages/parent/ParentWellness";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAtRiskPage from "./pages/teacher/TeacherAtRiskPage";
import TeacherTopicAnalyticsPage from "./pages/teacher/TeacherTopicAnalyticsPage";
import TeacherInterventionPage from "./pages/teacher/TeacherInterventionPage";

// Main application router configuration
export const router = createBrowserRouter([
  {
    // Redirect root "/" to the login page
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    // Login page where users choose whether they are a student, parent, or teacher
    path: "/login",
    element: <LoginPage />,
  },
  {
    // Student dashboard route
    path: "/student/overview",
    element: <StudentDashboard />,
  },
  {
    // Student practice route
    path: "/student/practice",
    element: <StudentPractice />
  },
  {
    // Student practice algebra route
    path: "/student/practice/algebra-drill",
    element: <AlgebraDrillSet />
  },
  {
    // Student studyplan route
    path: "/student/study-plan",
    element: <StudentStudyPlan />
  },
  {
    // Student progress route
    path: "/student/progress",
    element: <StudentProgress />
  },
  {
    // Student wellness route     
    path: "/student/wellness",
    element: <StudentWellness />
  },
  {
    // Parent dashboard route
    path: "/parent/overview",
    element: <ParentDashboard />,
  },
  {
    // Parent child progress route
    path: "/parent/child-progress",
    element: <ParentChildProgressPage />,
  },
  {
    // Parent weak topics route
    path: "/parent/weak-topics",
    element: <ParentWeakTopicsPage />,
  },
  {
    // Parent recommendations route
    path: "/parent/recommendations",
    element: <ParentRecommendationsPage />,
  },
  {
    // Parent wellness route
    path: "/parent/wellness",
    element: <ParentWellness />,
  },
  {
    // Teacher overview route
    path: "/teacher/overview",
    element: <TeacherDashboard />,
  },
  {
    // Teacher at risk route
    path: "/teacher/at-risk",
    element: <TeacherAtRiskPage />,
  },
  {
    // Teacher topic analytics route
    path: "/teacher/topic-analytics",
    element: <TeacherTopicAnalyticsPage />,
  },
  {
    // Teacher intervention route
    path: "/teacher/intervention",
    element: <TeacherInterventionPage />,
  },
]);
