import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'
import { useUserStore } from './stores/userStore'
import AuthView from './pages/AuthView'
import DailyView from './pages/DailyView'
import GoalsView from './pages/GoalsView'
import CreateCategoryView from './pages/CreateCategoryView'
import CategoryView from './pages/CategoryView'
import CalendarView from './pages/CalendarView'
import SettingsView from './pages/SettingsView'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, fetchUser } = useUserStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetchUser()
      }
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthView />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DailyView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals/create"
          element={
            <ProtectedRoute>
              <CreateCategoryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category/:id"
          element={
            <ProtectedRoute>
              <CategoryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App