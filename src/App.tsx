import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { AuthProvider } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ProjectsList } from '@/pages/ProjectsList';
import { ProjectDetails } from '@/pages/ProjectDetails';
import { Calculator } from '@/pages/Calculator';
import { MaterialsLibrary } from '@/pages/MaterialsLibrary';
import { Categories } from '@/pages/Categories';
import { Templates } from '@/pages/Templates';

function AppRoutes() {
  const initialize = useStore((state) => state.initialize);
  const { language, dir } = useTranslation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/calculator/:id" element={<Calculator />} />
          <Route path="/materials" element={<MaterialsLibrary />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/templates" element={<Templates />} />
        </Route>
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
