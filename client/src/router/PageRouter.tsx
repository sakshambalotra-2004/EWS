import React from 'react';
import type { Role } from '../types';

// Admin pages
import AdminDashboard  from '../pages/AdminDashboard';
import AdminUsers      from '../pages/AdminUsers';
import AdminAnalytics  from '../pages/AdminAnalytics';

// Faculty pages
import FacultyDashboard from '../pages/FacultyDashboard';
import UploadMarks      from '../pages/UploadMarks';
import BehaviorRating   from '../pages/BehaviorRating';

// Counselor pages
import CounselorDashboard  from '../pages/CounselorDashboard';
import UploadData          from '../pages/UploadData';
import GeneratePrediction  from '../pages/GeneratePrediction';
import RiskAnalysis        from '../pages/RiskAnalysis';
import Interventions       from '../pages/Interventions';

// Student pages
import StudentDashboard from '../pages/StudentDashboard';
import MyProgress       from '../pages/MyProgress';
import GetHelp          from '../pages/GetHelp';

interface PageRouterProps {
  role: Role;
  page: string;
  riskGenerated: boolean;
  onGenerate: () => void;
}

export default function PageRouter({ role, page, riskGenerated, onGenerate }: PageRouterProps) {
  const routes: Record<Role, Record<string, React.ReactNode>> = {
    admin: {
      'Dashboard': <AdminDashboard />,
      'Users':     <AdminUsers />,
      'Analytics': <AdminAnalytics />,
    },
    faculty: {
      'Dashboard':       <FacultyDashboard />,
      'Upload Marks':    <UploadMarks />,
      'Behavior Rating': <BehaviorRating />,
    },
    counselor: {
      'Dashboard':           <CounselorDashboard riskGenerated={riskGenerated} />,
      'Upload Data':         <UploadData />,
      'Generate Prediction': <GeneratePrediction onGenerate={onGenerate} riskGenerated={riskGenerated} />,
      'Risk Analysis':       <RiskAnalysis riskGenerated={riskGenerated} />,
      'Interventions':       <Interventions />,
    },
    student: {
      'Dashboard':   <StudentDashboard riskGenerated={riskGenerated} />,
      'My Progress': <MyProgress />,
      'Get Help':    <GetHelp />,
    },
  };

  return (
    <>
      {routes[role]?.[page] ?? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Page not found
        </div>
      )}
    </>
  );
}
