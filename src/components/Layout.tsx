import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuth } from '@/auth/AuthProvider';
import { useShopStore } from '@/stores/useShopStore';
import { ShopSelector } from '@/components/ShopSelector';

interface NavItem {
  readonly labelKey: string;
  readonly icon: string;
  readonly to: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { labelKey: 'nav.dashboard', icon: 'dashboard', to: '/' },
  { labelKey: 'pipeline.title', icon: 'view_kanban', to: '/pipeline' },
  { labelKey: 'nav.projects', icon: 'square_foot', to: '/projects' },
  { labelKey: 'nav.expenses', icon: 'receipt_long', to: '/expenses' },
  { labelKey: 'reports.title', icon: 'insights', to: '/reports' },
  { labelKey: 'nav.materialsLibrary', icon: 'layers', to: '/materials' },
  { labelKey: 'nav.templates', icon: 'description', to: '/templates' },
  { labelKey: 'productTypes2.title', icon: 'sell', to: '/product-types' },
  { labelKey: 'nav.settings', icon: 'tune', to: '/settings' },
] as const;

const MOBILE_NAV_ITEMS: readonly NavItem[] = [
  { labelKey: 'nav.dashboard', icon: 'dashboard', to: '/' },
  { labelKey: 'pipeline.title', icon: 'view_kanban', to: '/pipeline' },
  { labelKey: 'nav.expenses', icon: 'receipt_long', to: '/expenses' },
  { labelKey: 'nav.projects', icon: 'square_foot', to: '/projects' },
] as const;

function SidebarUser() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  if (!user) return null;

  const name = user.user_metadata?.full_name || user.email || t('layout.userFallback');
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-lg">
      {avatar ? (
        <img src={avatar} alt="" className="w-8 h-8 rounded-full" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate">{name}</p>
      </div>
      <button
        onClick={signOut}
        className="text-secondary hover:text-error transition-colors"
        title={t('layout.signOut')}
      >
        <Icon name="logout" className="text-lg" />
      </button>
    </div>
  );
}

function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shops, activeShopId, role, isAdmin } = useShopStore();
  const activeShop = shops.find((s) => s.id === activeShopId);

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:start-0 md:w-64 bg-[#eeeeeb] border-e border-outline-variant z-30 print:hidden">
      <div className="p-6">
        <h1 className="font-headline text-primary font-bold text-lg">
          {activeShop?.name || t('auth.precisionWorkshop')}
        </h1>
        <span
          className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full ${
            role === 'manager'
              ? 'bg-primary/10 text-primary'
              : 'bg-secondary/10 text-secondary'
          }`}
        >
          {role === 'manager' ? t('shop.manager') : t('shop.member')}
        </span>
      </div>

      <div className="px-3 mb-2">
        <ShopSelector />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#f9f9f6] text-[#a43700] font-bold border-e-4 border-[#a43700]'
                  : 'text-on-surface opacity-70 hover:bg-[#f4f4f1]'
              }`
            }
          >
            <Icon name={item.icon} className="text-xl" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}

        {role === 'manager' && (
          <NavLink
            to="/shop/manage"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#f9f9f6] text-[#a43700] font-bold border-e-4 border-[#a43700]'
                  : 'text-on-surface opacity-70 hover:bg-[#f4f4f1]'
              }`
            }
          >
            <Icon name="settings" className="text-xl" />
            <span>{t('shop.shopSettings')}</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#f9f9f6] text-[#a43700] font-bold border-e-4 border-[#a43700]'
                  : 'text-on-surface opacity-70 hover:bg-[#f4f4f1]'
              }`
            }
          >
            <Icon name="admin_panel_settings" className="text-xl" />
            <span>{t('admin.title')}</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 space-y-3">
        <button
          onClick={() => navigate('/calculator')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary-container transition-colors"
        >
          <Icon name="calculate" className="text-xl" />
          {t('common.quickCalc')}
        </button>
        <SidebarUser />
      </div>
    </aside>
  );
}

function TopBar() {
  const { t, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant print:hidden">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <h2 className="font-headline text-on-surface font-bold text-sm uppercase tracking-wider">
          {t('auth.precisionWorkshop')}
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-xs font-bold border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
          >
            {language === 'en' ? 'HE' : 'EN'}
          </button>
          <button
            onClick={() => navigate('/calculator')}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
          >
            <Icon name="add" className="text-lg" />
            {t('common.newProject')}
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-outline-variant print:hidden">
      <div className="flex items-center justify-around h-16">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-secondary'
              }`
            }
          >
            <Icon name={item.icon} className="text-xl" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <Sidebar />
      <div className="md:ms-64 print:ms-0">
        <TopBar />
        <main className="p-4 md:p-6 pb-20 md:pb-6 print:p-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
