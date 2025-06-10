/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */

export enum LaWalletKinds {
  REGULAR = 1112,
  EPHEMERAL = 21111,
  PARAMETRIZED_REPLACEABLE = 31111,
}

export enum LaWalletTags {
  INTERNAL_TRANSACTION_START = 'internal-transaction-start',
  INTERNAL_TRANSACTION_OK = 'internal-transaction-ok',
  INTERNAL_TRANSACTION_ERROR = 'internal-transaction-error',
  INBOUND_TRANSACTION_START = 'inbound-transaction-start',
  INBOUND_TRANSACTION_OK = 'inbound-transaction-ok',
  INBOUND_TRANSACTION_ERROR = 'inbound-transaction-error',
  OUTBOUND_TRANSACTION_OK = 'outbound-transaction-ok',
  OUTBOUND_TRANSACTION_ERROR = 'outbound-transaction-error',
  CREATE_IDENTITY = 'create-identity',
  CARD_ACTIVATION_REQUEST = 'card-activation-request',
  CARD_TRANSFER_DONATION = 'card-transfer-donation',
  CARD_TRANSFER_ACCEPTANCE = 'card-transfer-acceptance',
  BUY_HANDLE_REQUEST = 'buy-handle-request',
  CREATE_NONCE = 'create-nonce',
}
