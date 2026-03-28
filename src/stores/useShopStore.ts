import { create } from 'zustand';
import type { Invitation, Shop, ShopMember, ShopRole } from '@/types';
import { supabase } from '@/lib/supabase';

const ACTIVE_SHOP_KEY = 'woodworking-active-shop';

interface ShopState {
  shops: Shop[];
  activeShopId: string | null;
  members: ShopMember[];
  invitations: Invitation[];
  role: ShopRole | null;
  isAdmin: boolean;
  loading: boolean;

  fetchShops: () => Promise<void>;
  setActiveShop: (shopId: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  createShop: (name: string, description?: string) => Promise<string>;
  createInvitation: (maxUses?: number) => Promise<Invitation | null>;
  deleteInvitation: (id: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: ShopRole) => Promise<void>;
  checkAdmin: () => Promise<void>;
  reset: () => void;
}

async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

function determineRole(
  shops: Shop[],
  shopId: string,
  memberRows: Record<string, unknown>[],
  userId: string,
): ShopRole | null {
  const match = memberRows.find(
    (r) => (r.shop_id as string) === shopId && (r.user_id as string) === userId,
  );
  if (!match) return null;
  return match.role as ShopRole;
}

const initialState = {
  shops: [],
  activeShopId: localStorage.getItem(ACTIVE_SHOP_KEY),
  members: [],
  invitations: [],
  role: null,
  isAdmin: false,
  loading: false,
};

export const useShopStore = create<ShopState>()((set, get) => ({
  ...initialState,

  fetchShops: async () => {
    try {
      set({ loading: true });
      const userId = await getUserId();

      const { data, error } = await supabase
        .from('shop_members')
        .select('*, shops(*)')
        .eq('user_id', userId);

      if (error) throw error;

      const memberRows = (data ?? []) as Record<string, unknown>[];
      const shops: Shop[] = memberRows.map((row) => {
        const s = row.shops as Record<string, unknown>;
        return {
          id: s.id as string,
          name: s.name as string,
          description: (s.description as string) ?? undefined,
          createdBy: s.created_by as string,
          createdAt: s.created_at as string,
          updatedAt: s.updated_at as string,
        };
      });

      const stored = localStorage.getItem(ACTIVE_SHOP_KEY);
      const activeShopId =
        stored && shops.some((s) => s.id === stored)
          ? stored
          : (shops[0]?.id ?? null);

      if (activeShopId) {
        localStorage.setItem(ACTIVE_SHOP_KEY, activeShopId);
      }

      const role = activeShopId
        ? determineRole(shops, activeShopId, memberRows, userId)
        : null;

      set({ shops, activeShopId, role, loading: false });
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      set({ loading: false });
    }
  },

  setActiveShop: async (shopId) => {
    try {
      localStorage.setItem(ACTIVE_SHOP_KEY, shopId);
      const userId = await getUserId();

      const { data } = await supabase
        .from('shop_members')
        .select('role')
        .eq('shop_id', shopId)
        .eq('user_id', userId)
        .maybeSingle();

      const role = data ? (data.role as ShopRole) : null;
      set({ activeShopId: shopId, role });

      await get().fetchMembers();
    } catch (error) {
      console.error('Failed to set active shop:', error);
    }
  },

  fetchMembers: async () => {
    try {
      const { activeShopId } = get();
      if (!activeShopId) return;

      const { data, error } = await supabase
        .from('shop_members')
        .select('*')
        .eq('shop_id', activeShopId);

      if (error) throw error;

      const members: ShopMember[] = (data ?? []).map(
        (row: Record<string, unknown>): ShopMember => ({
          id: row.id as string,
          shopId: row.shop_id as string,
          userId: row.user_id as string,
          role: row.role as ShopRole,
          joinedAt: row.joined_at as string,
          email: (row.email as string) ?? undefined,
          fullName: (row.full_name as string) ?? undefined,
          avatarUrl: (row.avatar_url as string) ?? undefined,
        }),
      );

      set({ members });
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  },

  fetchInvitations: async () => {
    try {
      const { activeShopId } = get();
      if (!activeShopId) return;

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('shop_id', activeShopId);

      if (error) throw error;

      const invitations: Invitation[] = (data ?? []).map(
        (row: Record<string, unknown>): Invitation => ({
          id: row.id as string,
          shopId: row.shop_id as string,
          token: row.token as string,
          createdBy: row.created_by as string,
          expiresAt: row.expires_at as string,
          maxUses: (row.max_uses as number) ?? undefined,
          useCount: row.use_count as number,
          createdAt: row.created_at as string,
        }),
      );

      set({ invitations });
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  },

  createShop: async (name, description) => {
    try {
      const { data, error } = await supabase.rpc('create_shop', {
        p_name: name,
        p_description: description ?? null,
      });

      if (error) throw error;

      const newShopId = data as string;
      await get().fetchShops();
      return newShopId;
    } catch (error) {
      console.error('Failed to create shop:', error);
      throw error;
    }
  },

  createInvitation: async (maxUses) => {
    try {
      const { activeShopId } = get();
      if (!activeShopId) return null;

      const userId = await getUserId();

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          shop_id: activeShopId,
          created_by: userId,
          max_uses: maxUses ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      const invitation: Invitation = {
        id: data.id as string,
        shopId: data.shop_id as string,
        token: data.token as string,
        createdBy: data.created_by as string,
        expiresAt: data.expires_at as string,
        maxUses: (data.max_uses as number) ?? undefined,
        useCount: data.use_count as number,
        createdAt: data.created_at as string,
      };

      await get().fetchInvitations();
      return invitation;
    } catch (error) {
      console.error('Failed to create invitation:', error);
      return null;
    }
  },

  deleteInvitation: async (id) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchInvitations();
    } catch (error) {
      console.error('Failed to delete invitation:', error);
    }
  },

  removeMember: async (memberId) => {
    try {
      const { error } = await supabase
        .from('shop_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await get().fetchMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  },

  updateMemberRole: async (memberId, role) => {
    try {
      const { error } = await supabase
        .from('shop_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      await get().fetchMembers();
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  },

  checkAdmin: async () => {
    try {
      const userId = await getUserId();

      const { data } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      set({ isAdmin: !!data });
    } catch (error) {
      console.error('Failed to check admin status:', error);
      set({ isAdmin: false });
    }
  },

  reset: () => {
    localStorage.removeItem(ACTIVE_SHOP_KEY);
    set({
      shops: [],
      activeShopId: null,
      members: [],
      invitations: [],
      role: null,
      isAdmin: false,
      loading: false,
    });
  },
}));
