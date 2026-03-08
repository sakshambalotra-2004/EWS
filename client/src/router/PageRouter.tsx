import React from 'react';

// Admin pages
import AdminDashboard  from '../pages/AdminDashboard';
import AdminUsers      from '../pages/AdminUsers';
import AdminAnalytics  from '../pages/AdminAnalytics';

// Faculty pages
import FacultyDashboard from '../pages/FacultyDashboard';
import UploadData       from '../pages/UploadData';
import UploadGPA        from '../pages/UploadGPA';
import BehaviorRating   from '../pages/BehaviorRating';

// Counselor pages
import CounselorDashboard from '../pages/CounselorDashboard';
import GeneratePrediction from '../pages/GeneratePrediction';
import RiskAnalysis       from '../pages/RiskAnalysis';
import Interventions      from '../pages/Interventions';

// Student pages
import StudentDashboard from '../pages/StudentDashboard';
import MyProgress       from '../pages/MyProgress';
import GetHelp          from '../pages/GetHelp';

// Auth
import ChangePassword   from '../pages/ChangePassword';

type Role = 'admin' | 'faculty' | 'counselor' | 'student';

interface PageRouterProps {
  role: Role;
  page: string;
}

const ROUTES: Record<Role, Record<string, React.ReactNode>> = {
  admin: {
    'Dashboard':   <AdminDashboard />,
    'Users':       <AdminUsers />,
    'Analytics':   <AdminAnalytics />,
    'Upload GPA':  <UploadGPA />,
  },
  faculty: {
    'Dashboard':       <FacultyDashboard />,
    'Upload Data':     <UploadData />,
    'Behavior Rating': <BehaviorRating />,
  },
  counselor: {
    'Dashboard':           <CounselorDashboard />,
    'Generate Prediction': <GeneratePrediction />,
    'Risk Analysis':       <RiskAnalysis />,
    'Interventions':       <Interventions />,
  },
  student: {
    'Dashboard':       <StudentDashboard />,
    'My Progress':     <MyProgress />,
    'Get Help':        <GetHelp />,
    'Change Password': <ChangePassword />,
  },
};

export default function PageRouter({ role, page }: PageRouterProps) {
  return (
    <>
      {ROUTES[role]?.[page] ?? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Page not found
        </div>
      )}
    </>
  );
}