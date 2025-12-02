import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { staffAuth, AuthState } from './lib/staffAuth'
import LoginPage from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Companies from './pages/Companies'
import CompanyDetailPage from './pages/CompanyDetailPage'
import DesktopApp from './pages/DesktopApp'
import Analytics from './pages/Analytics'
import Admin from './pages/Admin'
import SmartAdvertising from './pages/SmartAdvertising'
import Support from './pages/Support'
import ScreenSharing from './pages/ScreenSharing'
import Apps from './pages/Apps'
import CrashReports from './pages/CrashReports'
import Sidebar from './components/Sidebar'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 PROTECTED ROUTE: Checking authentication...');
        const state = await staffAuth.init()
        console.log('🔐 PROTECTED ROUTE: Auth state:', state);
        setAuthState(state)
      } catch (error) {
        console.error('🔐 PROTECTED ROUTE: Auth check failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed'
        })
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authState?.isAuthenticated) {
    console.log('🔐 PROTECTED ROUTE: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />
  }
  
  console.log('🔐 PROTECTED ROUTE: Authentication successful, rendering protected content');

  return <>{children}</>
}

// Layout Component for authenticated pages
const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await staffAuth.getCurrentUser()
      setUser(currentUser)
    }
    getUser()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #374151)',
            border: '1px solid var(--toast-border, #e5e7eb)',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #16a34a',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #dc2626',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <PortalLayout>
              <Dashboard />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PortalLayout>
              <Dashboard />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <PortalLayout>
              <Users />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/companies" element={
          <ProtectedRoute>
            <PortalLayout>
              <Companies />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/companies/:id" element={
          <ProtectedRoute>
            <PortalLayout>
              <CompanyDetailPage />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/desktop-app" element={
          <ProtectedRoute>
            <PortalLayout>
              <DesktopApp />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <PortalLayout>
              <Analytics />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <PortalLayout>
              <Admin />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/smart-advertising" element={
          <ProtectedRoute>
            <PortalLayout>
              <SmartAdvertising />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/support" element={
          <ProtectedRoute>
            <PortalLayout>
              <Support />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/screen-sharing" element={
          <ProtectedRoute>
            <PortalLayout>
              <ScreenSharing />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/apps" element={
          <ProtectedRoute>
            <PortalLayout>
              <Apps />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/crash-reports" element={
          <ProtectedRoute>
            <PortalLayout>
              <CrashReports />
            </PortalLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
