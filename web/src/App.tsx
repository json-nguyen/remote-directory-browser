import { Route, Routes } from 'react-router-dom';
import DirectoryPage from '@/pages/DirectoryPage';
import { GlobalStyle } from '@/styles/GlobalStyle';
import LoginPage from './pages/LoginPage';
import AuthGuard from './components/AuthGuard';
import IndexRedirect from './components/IndexRedirect';
import { AuthProvider } from './context/AuthContext';
import NotFound from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';

export function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<IndexRedirect />} />
        <Route
          path="/files/*"
          element={
            <AuthGuard>
              <DirectoryPage />
            </AuthGuard>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
