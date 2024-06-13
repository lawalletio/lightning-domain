import { requiredEnvVar } from './utils';

// Required
export const ADMIN_PRIVATE_KEY: string = requiredEnvVar('ADMIN_NOSTR_PRIVATE_KEY');

// Autocompleted
export const AUTOCREATE_NONCE: string = process.env.AUTOCREATE_NONCE ?? '';

export const SIGNUP_ENABLED: boolean = Boolean(process.env.SIGNUP_ENABLED);
export const SIGNUP_NIP05_RECEIVER: string = process.env.SIGNUP_NIP05_RECEIVER ?? 'tesoro@lawallet.ar';
export const SIGNUP_MSATS_PRICE: number = Number(process.env.SIGNUP_MSATS_PRICE) ?? 21000;
