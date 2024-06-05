import { requiredEnvVar } from '~/lib/utils';

const LAWALLET_LEDGER_PUBKEY: string = 'bd9b0b60d5cd2a9df282fc504e88334995e6fac8b148fa89e0f8c09e2a570a84';

// Required
export const ADMIN_PUBLISHER_PRIVATE_KEY: string = requiredEnvVar('NOSTR_IDENTITY_PUBLISHER_PRIVATE_KEY');
export const NOSTR_CARD_PUBLIC_KEY: string = requiredEnvVar('NOSTR_CARD_PUBLIC_KEY');
export const NOSTR_NONCE_ADMIN_PUBLIC_KEY: string = requiredEnvVar('NOSTR_NONCE_ADMIN_PUBLIC_KEY');

// Autocompleted
export const AUTOCREATE_NONCE: string = process.env.AUTOCREATE_NONCE ?? '';
export const LAWALLET_API_DOMAIN: string = process.env.LAWALLET_API_DOMAIN ?? 'https://api.lawallet.ar';
export const NOSTR_LEDGER_PUBLIC_KEY = process.env.NOSTR_LEDGER_PUBLIC_KEY ?? LAWALLET_LEDGER_PUBKEY;

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
