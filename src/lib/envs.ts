import { requiredEnvVar } from './utils';

// Required
export const ADMIN_PRIVATE_KEY: string = requiredEnvVar('ADMIN_NOSTR_PRIVATE_KEY');

// Autocompleted
export const AUTOCREATE_NONCE: string = process.env.AUTOCREATE_NONCE ?? '';

// Voucher
export const VOUCHER_PRIVATE_KEY: string = process.env.VOUCHER_PRIVATE_KEY ?? '';
export const VOUCHER_VERIFICATION_CODE_LENGTH = parseInt(process.env.VOUCHER_VERIFICATION_CODE_LENGTH ?? '8');

export const VOUCHER_AMOUNT = parseInt(process.env.VOUCHER_AMOUNT ?? '1000');
export const VOUCHER_TOKEN = process.env.VOUCHER_TOKEN ?? 'BTC';

// Mail
export const SENDGRID_API_KEY: string = process.env.SENDGRID_API_KEY ?? '';
export const SMTP_HOST = process.env.SMTP_HOST ?? '';
export const SMTP_USERNAME = process.env.SMTP_USERNAME ?? '';
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? '';
