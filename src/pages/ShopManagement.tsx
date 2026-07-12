import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/i18n/useTranslation';
import { useShopStore } from '@/stores/useShopStore';
import { supabase } from '@/lib/supabase';
import type { ShopRole } from '@/types';

function ShopInfoSection() {
  const { t } = useTranslation();
  const activeShopId = useShopStore((state) => state.activeShopId);
  const shops = useShopStore((state) => state.shops);

  const activeShop = shops.find((s) => s.id === activeShopId);

  const [name, setName] = useState(activeShop?.name ?? '');
  const [description, setDescription] = useState(activeShop?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeShop) {
      setName(activeShop.name);
      setDescription(activeShop.description ?? '');
    }
  }, [activeShop]);

  const handleSave = async () => {
    if (!activeShopId || !name.trim()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('shops')
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq('id', activeShopId);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update shop:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
        <Icon name="store" className="text-2xl text-primary" />
        {t('shopManagement.shopInfo')}
      </h2>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            {t('onboarding.shopName')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-headline text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            {t('onboarding.shopDescription')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full max-w-md px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {isSaving ? t('common.saving') : t('common.save')}
          </button>

          {saveSuccess && (
            <span className="text-tertiary text-sm font-medium flex items-center gap-1">
              <Icon name="check" className="text-lg" />
              {t('shopManagement.saved')}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function MembersSection() {
  const { t } = useTranslation();
  const members = useShopStore((state) => state.members);
  const role = useShopStore((state) => state.role);
  const updateMemberRole = useShopStore((state) => state.updateMemberRole);
  const removeMember = useShopStore((state) => state.removeMember);
  const fetchMembers = useShopStore((state) => state.fetchMembers);

  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const isManager = role === 'manager';

  const handleToggleRole = async (memberId: string, currentRole: ShopRole) => {
    const newRole: ShopRole = currentRole === 'manager' ? 'member' : 'manager';
    await updateMemberRole(memberId, newRole);
  };

  const handleRemove = async (memberId: string) => {
    await removeMember(memberId);
    setConfirmRemoveId(null);
  };

  const truncateId = (id: string): string => {
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
          <Icon name="group" className="text-2xl text-primary" />
          {t('shopManagement.members')}
        </h2>
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
          {members.length}
        </span>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-start px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('shopManagement.user')}
                </th>
                <th className="text-start px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                  {t('shopManagement.role')}
                </th>
                {isManager && (
                  <th className="text-end px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                    {t('shopManagement.actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-outline-variant/10 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">
                        {member.fullName ?? member.email ?? truncateId(member.userId)}
                      </span>
                      {member.email && (
                        <span className="text-xs text-secondary">{member.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        member.role === 'manager'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {t(`shopManagement.${member.role}`)}
                    </span>
                  </td>
                  {isManager && (
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleRole(member.id, member.role)}
                          className="px-2 py-1 text-xs font-medium text-secondary hover:text-primary border border-outline-variant/30 rounded-lg hover:border-primary/30 transition-colors"
                          title={
                            member.role === 'manager'
                              ? t('shopManagement.makeMember')
                              : t('shopManagement.makeManager')
                          }
                        >
                          {member.role === 'manager'
                            ? t('shopManagement.makeMember')
                            : t('shopManagement.makeManager')}
                        </button>

                        {confirmRemoveId === member.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRemove(member.id)}
                              className="px-2 py-1 text-xs font-bold text-error bg-error-container rounded-lg hover:bg-error hover:text-on-error transition-colors"
                            >
                              {t('shopManagement.confirm')}
                            </button>
                            <button
                              onClick={() => setConfirmRemoveId(null)}
                              className="px-2 py-1 text-xs font-medium text-secondary"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRemoveId(member.id)}
                            className="p-1 text-secondary hover:text-error transition-colors"
                            title={t('shopManagement.removeMember')}
                          >
                            <Icon name="person_remove" className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function InvitationsSection() {
  const { t } = useTranslation();
  const invitations = useShopStore((state) => state.invitations);
  const createInvitation = useShopStore((state) => state.createInvitation);
  const deleteInvitation = useShopStore((state) => state.deleteInvitation);
  const fetchInvitations = useShopStore((state) => state.fetchInvitations);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const buildInviteLink = (token: string): string => {
    return `${window.location.origin}/invite/${token}`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const invitation = await createInvitation();
      if (invitation) {
        const link = buildInviteLink(invitation.token);
        await navigator.clipboard.writeText(link);
        setCopiedToken(invitation.token);
        setTimeout(() => setCopiedToken(null), 2000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = useCallback(async (token: string) => {
    const link = buildInviteLink(token);
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }, []);

  const handleRevoke = async (id: string) => {
    await deleteInvitation(id);
  };

  const truncateToken = (token: string): string => {
    return `${token.slice(0, 12)}...`;
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
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
          <Icon name="link" className="text-2xl text-primary" />
          {t('shopManagement.invitationLinks')}
        </h2>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          <Icon name="add_link" className="text-lg" />
          {isGenerating ? t('shopManagement.generating') : t('shopManagement.generateLink')}
        </button>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 text-center">
          <Icon name="link_off" className="text-4xl text-secondary/40 mb-2" />
          <p className="text-sm text-secondary">{t('shopManagement.noInvitations')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-on-surface truncate">
                  {truncateToken(invitation.token)}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-secondary">
                  <span>
                    {t('shopManagement.expires')}: {formatDate(invitation.expiresAt)}
                  </span>
                  <span>
                    {t('shopManagement.uses')}: {invitation.useCount}
                    {invitation.maxUses != null ? `/${invitation.maxUses}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyLink(invitation.token)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-outline-variant/30 rounded-lg hover:border-primary/30 text-secondary hover:text-primary transition-colors"
                >
                  <Icon
                    name={copiedToken === invitation.token ? 'check' : 'content_copy'}
                    className="text-sm"
                  />
                  {copiedToken === invitation.token
                    ? t('shopManagement.copied')
                    : t('shopManagement.copyLink')}
                </button>

                <button
                  onClick={() => handleRevoke(invitation.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-error border border-error/20 rounded-lg hover:bg-error-container transition-colors"
                >
                  <Icon name="delete" className="text-sm" />
                  {t('shopManagement.revoke')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ShopManagement() {
  const { t } = useTranslation();
  const role = useShopStore((state) => state.role);

  if (role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
          <Icon name="lock" className="text-3xl text-error" />
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface">
          {t('shopManagement.accessDenied')}
        </h2>
        <p className="text-sm text-secondary">
          {t('shopManagement.managersOnly')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <h1 className="font-headline text-2xl font-bold text-on-surface">
        {t('shopManagement.title')}
      </h1>

      <ShopInfoSection />
      <MembersSection />
      <InvitationsSection />
    </div>
  );
}
