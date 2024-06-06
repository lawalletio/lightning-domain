import { requiredEnvVar } from './utils';

// Required
export const ADMIN_PUBLISHER_PRIVATE_KEY: string = requiredEnvVar('NOSTR_IDENTITY_PUBLISHER_PRIVATE_KEY');
export const NOSTR_NONCE_ADMIN_PRIVATE_KEY: string = requiredEnvVar('NOSTR_NONCE_ADMIN_PRIVATE_KEY');
export const NOSTR_CARD_PUBLIC_KEY: string = requiredEnvVar('NOSTR_CARD_PUBLIC_KEY');

// Autocompleted
export const AUTOCREATE_NONCE: string = process.env.AUTOCREATE_NONCE ?? '';
export const LAWALLET_API_DOMAIN: string = process.env.LAWALLET_API_DOMAIN ?? 'https://api.lawallet.ar';

// Voucher
export const VOUCHER_PRIVATE_KEY: string = process.env.NOSTR_VOUCHER_PRIVATE_KEY ?? '';
export const VOUCHER_VERIFICATION_CODE_LENGTH = parseInt(process.env.VOUCHER_VERIFICATION_CODE_LENGTH ?? '8');

export const VOUCHER_AMOUNT = parseInt(process.env.VOUCHER_AMOUNT ?? '1000');
export const VOUCHER_TOKEN = process.env.VOUCHER_TOKEN ?? 'BTC';

// Mail
export const SENGRID_API_KEY: string = process.env.SENDGRID_API_KEY ?? '';
export const SMTP_HOST = process.env.SMTP_HOST ?? '';
export const SMTP_USERNAME = process.env.SMTP_USERNAME ?? '';
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? '';
