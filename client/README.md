# SMART-EWS — Smart Early Warning System

A modern academic risk prediction dashboard built with **React + Vite + TypeScript + Tailwind CSS**.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Card.tsx
│   ├── StatCard.tsx
│   ├── ProgressBar.tsx
│   ├── RiskBadge.tsx
│   ├── Sidebar.tsx
│   └── PredictionLoader.tsx
│
├── pages/               # One file per page/view
│   ├── AdminDashboard.tsx
│   ├── AdminUsers.tsx
│   ├── AdminAnalytics.tsx
│   ├── FacultyDashboard.tsx
│   ├── UploadMarks.tsx
│   ├── BehaviorRating.tsx
│   ├── CounselorDashboard.tsx
│   ├── UploadData.tsx
│   ├── GeneratePrediction.tsx
│   ├── RiskAnalysis.tsx
│   ├── Interventions.tsx
│   ├── StudentDashboard.tsx
│   ├── MyProgress.tsx
│   └── GetHelp.tsx
│
├── layouts/             # Page shell / wrapper
│   └── MainLayout.tsx
│
├── router/              # Route mapping
│   └── PageRouter.tsx
│
├── data/                # Static mock data
│   └── index.ts
│
├── types/               # TypeScript interfaces
│   └── index.ts
│
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Tailwind + global styles
```

---

## 🎭 Roles

| Role      | Pages                                                                 |
|-----------|-----------------------------------------------------------------------|
| Admin     | Dashboard, Users, Analytics                                           |
| Faculty   | Dashboard, Upload Marks, Behavior Rating                              |
| Counselor | Dashboard, Upload Data, Generate Prediction, Risk Analysis, Interventions |
| Student   | Dashboard, My Progress, Get Help                                      |

> Use the **Switch Role** panel in the sidebar to switch between roles.

---

## ✨ Key Features

- 🤖 **AI Risk Prediction** — animated loading flow with 4-step progress
- 📊 **Charts** — Pie, Bar, Line charts via Recharts
- 🎯 **Risk Analysis** — per-student contributing factors with progress bars
- 💬 **Interventions** — create and track student intervention records
- ⭐ **Behavior Rating** — slider-based rating system for faculty
- 📤 **CSV Upload** — drag-and-drop upload UI

---

## 🛠 Tech Stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
