import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'phone_number', type: 'string' },
        { name: 'kyc_status', type: 'string' },
        { name: 'biometric_enabled', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'transaction_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'recipient_name', type: 'string' },
        { name: 'recipient_phone', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'exchange_rate', type: 'number' },
        { name: 'fee', type: 'number' },
        { name: 'total_amount', type: 'number' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'reference', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'sync_status', type: 'string' },
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'kyc_documents',
      columns: [
        { name: 'document_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'front_image_uri', type: 'string' },
        { name: 'back_image_uri', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'sync_status', type: 'string' },
        { name: 'uploaded_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sync_items',
      columns: [
        { name: 'sync_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'action', type: 'string' },
        { name: 'data', type: 'string' }, // JSON string
        { name: 'timestamp', type: 'number' },
        { name: 'retry_count', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'exchange_rates',
      columns: [
        { name: 'from_currency', type: 'string' },
        { name: 'to_currency', type: 'string' },
        { name: 'rate', type: 'number' },
        { name: 'timestamp', type: 'number' },
        { name: 'source', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'notifications',
      columns: [
        { name: 'notification_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'body', type: 'string' },
        { name: 'data', type: 'string', isOptional: true }, // JSON string
        { name: 'read', type: 'boolean' },
        { name: 'received_at', type: 'number' },
      ],
    }),
  ],
});