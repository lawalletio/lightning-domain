import { requiredEnvVar } from '~/lib/utils';

export const ADMIN_PUBLISHER_PRIVATE_KEY: string = requiredEnvVar('NOSTR_IDENTITY_PUBLISHER_PRIVATE_KEY');

export const NOSTR_CARD_PUBLIC_KEY: string = requiredEnvVar('NOSTR_CARD_PUBLIC_KEY');

export const NOSTR_NONCE_ADMIN_PUBLIC_KEY: string = requiredEnvVar('NOSTR_NONCE_ADMIN_PUBLIC_KEY');

export const AUTOCREATE_NONCE: string = process.env.AUTOCREATE_NONCE ?? '';
