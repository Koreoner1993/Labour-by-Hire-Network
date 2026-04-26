export const TRADES = [
  'All', 'Carpenter', 'Electrician', 'Plumber', 'Concretor',
  'Painter', 'Tiler', 'Roofer', 'Landscaper', 'Bricklayer',
  'Welder', 'Plasterer', 'General Labourer',
];

export const EQUIP_CATS = [
  'All', 'Cranes', 'EWP / Scissor Lifts', 'Excavators',
  'Concrete & Compaction', 'Scaffolding', 'Power Tools', 'Utes & Trailers',
];

export const EQUIP_ICONS: Record<string, string> = {
  'Cranes': '🏗️',
  'EWP / Scissor Lifts': '🔧',
  'Excavators': '🚜',
  'Concrete & Compaction': '🪨',
  'Scaffolding': '🔩',
  'Power Tools': '🔨',
  'Utes & Trailers': '🚚',
  'default': '⚙️',
};

export const SITE_STATUS = {
  CLEARED: { label: 'Site Cleared', color: 'text-green', bg: 'bg-green/10', border: 'border-green/20' },
  PENDING: { label: 'Pending Review', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
  NOT_APPROVED: { label: 'Not Approved', color: 'text-red', bg: 'bg-red/10', border: 'border-red/20' },
} as const;

export function getSiteStatus(score: number, licVerified: boolean, wcVerified: boolean) {
  if (score >= 60 && licVerified && wcVerified) return SITE_STATUS.CLEARED;
  if (score >= 30 || licVerified || wcVerified) return SITE_STATUS.PENDING;
  return SITE_STATUS.NOT_APPROVED;
}

export function getTrustLabel(score: number) {
  if (score >= 90) return 'Elite';
  if (score >= 75) return 'Excellent';
  if (score >= 55) return 'Good';
  if (score >= 35) return 'Building';
  return 'New';
}

export const ENDPOINTS = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_PROFILE: '/auth/profile',
  AUTH_LISTING: '/auth/listing',
  WORKERS: '/workers',
  WORKER_BY_ID: (id: string) => `/workers/${id}`,
  LISTINGS: '/listings',
  LISTING_BY_ID: (id: string) => `/listings/${id}`,
  EQUIPMENT: '/equipment',
  EQUIPMENT_BY_ID: (id: string) => `/equipment/${id}`,
  MESSAGES: '/messages',
  MESSAGES_BY_WORKER: (workerId: string) => `/messages/${workerId}`,
  MESSAGE_READ: (id: string) => `/messages/${id}/read`,
  WAITLIST: '/waitlist',
  WAITLIST_COUNT: '/waitlist/count',
  NOTIFICATIONS: '/notifications',
} as const;

export const EQUIPMENT_CATEGORIES = EQUIP_CATS;

export const TRUST_SCORE_LABELS = {
  0: 'Not Verified',
  1: 'Basic',
  2: 'Verified',
  3: 'Trusted',
  4: 'Excellent',
} as const;

export const VERIFICATION_TYPES = {
  EMAIL: 'email',
  LICENCE: 'licence_number',
  WHITE_CARD: 'white_card',
  WALLET: 'wallet_address',
} as const;
