import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { useShopStore } from '@/stores/useShopStore';
import { useTranslation } from '@/i18n/useTranslation';
import { AuthProvider } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { ShopRequired } from '@/auth/ShopRequired';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ProjectsList } from '@/pages/ProjectsList';
import { ProjectDetails } from '@/pages/ProjectDetails';
import { Calculator } from '@/pages/Calculator';
import { MaterialsLibrary } from '@/pages/MaterialsLibrary';
import { Categories } from '@/pages/Categories';
import { Templates } from '@/pages/Templates';
import { Onboarding } from '@/pages/Onboarding';
import { AcceptInvitation } from '@/pages/AcceptInvitation';
import { ShopManagement } from '@/pages/ShopManagement';
import { AdminPanel } from '@/pages/AdminPanel';

function AppRoutes() {
  const { language, dir } = useTranslation();
  const activeShopId = useShopStore((s) => s.activeShopId);

  useEffect(() => {
    if (activeShopId) {
      useStore.getState().fetchAll();
    }
  }, [activeShopId]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/invite/:token" element={<AcceptInvitation />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<ShopRequired />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/calculator/:id" element={<Calculator />} />
            <Route path="/materials" element={<MaterialsLibrary />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/shop/manage" element={<ShopManagement />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
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
