import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class SyncItemModel extends Model {
  static table = 'sync_items';

  @field('sync_id') syncId!: string;
  @field('type') type!: string;
  @field('action') action!: string;
  @field('data') data!: string; // JSON string
  @date('timestamp') timestamp!: Date;
  @field('retry_count') retryCount!: number;
}