import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'
import { useUserStore } from './stores/userStore'
import AuthView from './pages/AuthView'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DailyView from './pages/DailyView'
import GoalsView from './pages/GoalsView'
import CreateCategoryView from './pages/CreateCategoryView'
import CategoryView from './pages/CategoryView'
import CalendarView from './pages/CalendarView'
import SettingsView from './pages/SettingsView'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[DEBUG] ProtectedRoute checkAuth');
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[DEBUG] getSession result', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id 
      });
      if (session) {
        try {
          // FIX: Appeler fetchUser via useUserStore.getState() pour éviter les dépendances
          await useUserStore.getState().fetchUser()
          console.log('[DEBUG] fetchUser success in checkAuth');
        } catch (error) {
          console.error('[DEBUG] Error fetching user:', error)
          // Retry once after a short delay
          setTimeout(async () => {
            try {
              await useUserStore.getState().fetchUser()
            } catch (retryError) {
              console.error('[DEBUG] Retry failed:', retryError)
            }
          }, 1000)
        }
      }
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[DEBUG] auth state change', { event, hasSession: !!session });
      if (session) {
        try {
          // FIX: Utiliser getState() pour éviter la dépendance
          await useUserStore.getState().fetchUser()
        } catch (error) {
          console.error('[DEBUG] Error fetching user on auth change:', error)
        }
      } else {
        // Clear user on sign out
        useUserStore.setState({ user: null })
      }
    })

    return () => subscription.unsubscribe()
    // FIX: Supprimé fetchUser des dépendances pour éviter les re-renders infinis
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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