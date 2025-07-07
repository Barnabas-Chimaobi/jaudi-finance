import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class TransactionModel extends Model {
  static table = 'transactions';

  @field('transaction_id') transactionId!: string;
  @field('user_id') userId!: string;
  @field('recipient_name') recipientName!: string;
  @field('recipient_phone') recipientPhone!: string;
  @field('amount') amount!: number;
  @field('currency') currency!: string;
  @field('exchange_rate') exchangeRate!: number;
  @field('fee') fee!: number;
  @field('total_amount') totalAmount!: number;
  @field('status') status!: string;
  @field('reference') reference!: string;
  @field('description') description!: string;
  @field('sync_status') syncStatus!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}