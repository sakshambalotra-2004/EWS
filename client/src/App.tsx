import React, { useState } from 'react'
import MainLayout from './layouts/MainLayout'
import PageRouter from './router/PageRouter'
import Auth from './pages/Auth'
import type { Role } from './types'

export default function App() {

  const token = localStorage.getItem("token")

  if (!token) {
    return <Auth />
  }

  const storedRole = (localStorage.getItem("role") || "student") as Role

  const [page, setPage] = useState("Dashboard")
  const [riskGenerated, setRiskGenerated] = useState(false)

  return (
    <MainLayout role={storedRole} page={page} setPage={setPage}>
      <PageRouter
        role={storedRole}
        page={page}
        riskGenerated={riskGenerated}
        onGenerate={() => setRiskGenerated(true)}
      />
    </MainLayout>
  )
}