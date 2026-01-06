import { Schema } from 'effect';
import { CustomerEmail } from './CustomerEmail';

/**
 * String50
 */
const String50 = Schema.String.pipe(
  Schema.minLength(1, { message: () => '1文字以上必要です' }),
  Schema.maxLength(50, { message: () => '50文字以内です' }),
  Schema.brand('String50'),
);

/**
 * PersonalName （個人名）
 */
export type PersonalName = typeof PersonalName.Type;
export const PersonalName = Schema.Struct({
  firstName: String50,
  lastName: String50,
});

/**
 * CustomerInfo （顧客情報）
 * - ValueObjectである
 */
export type CustomerInfo = typeof CustomerInfo.Type;
export const CustomerInfo = Schema.Struct({
  name: PersonalName,
  emailAddress: CustomerEmail,
});

/**
 * UnvalidatedCustomerInfo（未検証の顧客情報）
 */
export type UnvalidatedCustomerInfo = {
  firstName: string;
  lastName: string;
  emailAddress: string;
};
