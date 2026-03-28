import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/i18n/useTranslation';
import { useShopStore } from '@/stores/useShopStore';
import { useStore } from '@/stores/useStore';
import type { ShopRole } from '@/types';

function RoleBadge({ role }: { role: ShopRole }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
        role === 'manager'
          ? 'bg-primary/10 text-primary'
          : 'bg-secondary-container text-on-secondary-container'
      }`}
    >
      {t(`shopManagement.${role}`)}
    </span>
  );
}

export function ShopSelector() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const shops = useShopStore((state) => state.shops);
  const activeShopId = useShopStore((state) => state.activeShopId);
  const setActiveShop = useShopStore((state) => state.setActiveShop);
  const members = useShopStore((state) => state.members);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeShop = shops.find((s) => s.id === activeShopId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getMemberRole = (shopId: string): ShopRole | null => {
    if (shopId === activeShopId) {
      return useShopStore.getState().role;
    }
    const member = members.find((m) => m.shopId === shopId);
    return member?.role ?? null;
  };

  const handleSelectShop = async (shopId: string) => {
    setIsOpen(false);
    if (shopId === activeShopId) return;

    await setActiveShop(shopId);
    await useStore.getState().fetchAll();
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    navigate('/onboarding');
  };

  if (!activeShop) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
      >
        <Icon name="store" className="text-lg text-primary" />
        <span className="max-w-[140px] truncate">{activeShop.name}</span>
        <Icon
          name={isOpen ? 'expand_less' : 'expand_more'}
          className="text-lg text-secondary"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-64 bg-surface-container-lowest shadow-lg border border-outline-variant/20 rounded-lg z-50 overflow-hidden">
          <div className="py-1">
            {shops.map((shop) => {
              const isActive = shop.id === activeShopId;
              const role = getMemberRole(shop.id);

              return (
                <button
                  key={shop.id}
                  onClick={() => handleSelectShop(shop.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <Icon
                    name={isActive ? 'check_circle' : 'store'}
                    className={`text-lg ${isActive ? 'text-primary' : 'text-secondary'}`}
                  />
                  <span className="flex-1 truncate">{shop.name}</span>
                  {role && <RoleBadge role={role} />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/20">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-tertiary hover:bg-surface-container-low transition-colors"
            >
              <Icon name="add_circle" className="text-lg" />
              <span className="font-medium">{t('shopSelector.createNew')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
