import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/i18n/useTranslation';
import { useShopStore } from '@/stores/useShopStore';
import { supabase } from '@/lib/supabase';

interface ShopWithCount {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly created_at: string;
  readonly memberCount: number;
}

interface AdminEntry {
  readonly id: string;
  readonly userId: string;
  readonly createdAt: string;
}

function AllShopsSection() {
  const { t } = useTranslation();
  const setActiveShop = useShopStore((state) => state.setActiveShop);

  const [shops, setShops] = useState<ShopWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*, shop_members(count)');

      if (error) throw error;

      const mapped: ShopWithCount[] = (data ?? []).map(
        (row: Record<string, unknown>) => {
          const membersAgg = row.shop_members as Array<{ count: number }> | undefined;
          return {
            id: row.id as string,
            name: row.name as string,
            description: row.description as string | null,
            created_at: row.created_at as string,
            memberCount: membersAgg?.[0]?.count ?? 0,
          };
        },
      );

      setShops(mapped);
    } catch (err) {
      console.error('Failed to fetch all shops:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllShops();
  }, [fetchAllShops]);

  const handleDeleteShop = async (shopId: string) => {
    try {
      const { error } = await supabase.from('shops').delete().eq('id', shopId);
      if (error) throw error;
      await fetchAllShops();
    } catch (err) {
      console.error('Failed to delete shop:', err);
    }
  };

  const handleViewShop = async (shopId: string) => {
    await setActiveShop(shopId);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
        <Icon name="storefront" className="text-2xl text-primary" />
        {t('admin.allShops')}
      </h2>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="progress_activity" className="text-primary text-3xl animate-spin" />
          </div>
        ) : shops.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-secondary">{t('admin.noShops')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('admin.shopName')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('shopManagement.members')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('admin.created')}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('shopManagement.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr
                    key={shop.id}
                    className="border-b border-outline-variant/10 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-on-surface">{shop.name}</span>
                      {shop.description && (
                        <p className="text-xs text-secondary mt-0.5 truncate max-w-xs">
                          {shop.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-on-surface">
                        <Icon name="group" className="text-sm text-secondary" />
                        {shop.memberCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {formatDate(shop.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewShop(shop.id)}
                          className="px-2 py-1 text-xs font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          {t('admin.view')}
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop.id)}
                          className="px-2 py-1 text-xs font-medium text-error border border-error/20 rounded-lg hover:bg-error-container transition-colors"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function AdminManagementSection() {
  const { t } = useTranslation();

  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [userIdInput, setUserIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('admins')
        .select('*');

      if (fetchError) throw fetchError;

      const mapped: AdminEntry[] = (data ?? []).map(
        (row: Record<string, unknown>): AdminEntry => ({
          id: row.id as string,
          userId: row.user_id as string,
          createdAt: row.created_at as string,
        }),
      );

      setAdmins(mapped);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async () => {
    if (!userIdInput.trim()) {
      setError(t('admin.userIdRequired'));
      return;
    }

    setError('');
    setIsAdding(true);

    try {
      const { error: insertError } = await supabase
        .from('admins')
        .insert({ user_id: userIdInput.trim() });

      if (insertError) throw insertError;

      setUserIdInput('');
      await fetchAdmins();
    } catch {
      setError(t('admin.addError'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchAdmins();
    } catch (err) {
      console.error('Failed to remove admin:', err);
    }
  };

  const truncateId = (id: string): string => {
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
        <Icon name="admin_panel_settings" className="text-2xl text-primary" />
        {t('admin.adminManagement')}
      </h2>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">
            {t('admin.addAdmin')}
          </h3>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder={t('admin.userIdPlaceholder')}
              className="flex-1 px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={handleAddAdmin}
              disabled={isAdding}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50 shrink-0"
            >
              {isAdding ? t('common.saving') : t('common.add')}
            </button>
          </div>
          {error && (
            <p className="text-xs text-error font-medium">{error}</p>
          )}
        </div>

        <div className="border-t border-outline-variant/20 pt-4">
          <h3 className="text-sm font-bold text-on-surface mb-3">
            {t('admin.currentAdmins')}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Icon name="progress_activity" className="text-primary text-2xl animate-spin" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-secondary">{t('admin.noAdmins')}</p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="shield_person" className="text-lg text-primary" />
                    <span className="text-sm font-mono text-on-surface">
                      {truncateId(admin.userId)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="p-1 text-secondary hover:text-error transition-colors"
                    title={t('admin.removeAdmin')}
                  >
                    <Icon name="close" className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function AdminPanel() {
  const { t } = useTranslation();
  const isAdmin = useShopStore((state) => state.isAdmin);
  const checkAdmin = useShopStore((state) => state.checkAdmin);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
          <Icon name="shield" className="text-3xl text-error" />
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface">
          {t('admin.accessDenied')}
        </h2>
        <p className="text-sm text-secondary">
          {t('admin.adminsOnly')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <h1 className="font-headline text-2xl font-bold text-on-surface">
        {t('admin.title')}
      </h1>

      <AllShopsSection />
      <AdminManagementSection />
    </div>
  );
}
