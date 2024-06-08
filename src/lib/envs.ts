import { requiredEnvVar } from './utils';

// Required
export const ADMIN_PRIVATE_KEY: string = requiredEnvVar('ADMIN_NOSTR_PRIVATE_KEY');

// Autocompleted
export const AUTOCREATE_NONCE: string = process.env.AUTOCREATE_NONCE ?? '';
