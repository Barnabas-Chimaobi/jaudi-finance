import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class UserModel extends Model {
  static table = 'users';

  @field('user_id') userId!: string;
  @field('email') email!: string;
  @field('first_name') firstName!: string;
  @field('last_name') lastName!: string;
  @field('phone_number') phoneNumber!: string;
  @field('kyc_status') kycStatus!: string;
  @field('biometric_enabled') biometricEnabled!: boolean;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}