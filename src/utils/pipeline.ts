import type { Status } from '@/types';

export const STATUS_TKEY: Record<Status, string> = {
  lead: 'status.lead',
  quoted: 'status.quoted',
  deposit_paid: 'status.depositPaid',
  in_production: 'status.inProduction',
  ready: 'status.ready',
  delivered: 'status.delivered',
  closed: 'status.closed',
};

export const STATUS_BADGE_CLASSES: Record<Status, string> = {
  lead: 'bg-surface-variant text-secondary',
  quoted: 'bg-secondary-container text-on-secondary-container',
  deposit_paid: 'bg-tertiary-container text-on-tertiary-container',
  in_production: 'bg-primary/10 text-primary',
  ready: 'bg-tertiary/10 text-tertiary',
  delivered: 'bg-tertiary/20 text-tertiary',
  closed: 'bg-surface-variant text-secondary',
};
