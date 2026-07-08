import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MediaLibraryPage from './pages/MediaLibraryPage.jsx'
import PlayerPage from './pages/PlayerPage.jsx'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/media" replace />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="media/:blobName" element={<PlayerPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
