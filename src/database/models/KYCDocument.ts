import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class KYCDocumentModel extends Model {
  static table = 'kyc_documents';

  @field('document_id') documentId!: string;
  @field('user_id') userId!: string;
  @field('type') type!: string;
  @field('front_image_uri') frontImageUri!: string;
  @field('back_image_uri') backImageUri!: string;
  @field('status') status!: string;
  @field('sync_status') syncStatus!: string;
  @date('uploaded_at') uploadedAt!: Date;
}