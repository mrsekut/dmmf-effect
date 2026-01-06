import { Schema } from 'effect';
import { CustomerEmail } from './CustomerEmail';

export type CustomerId = typeof CustomerId.Type;
export const CustomerId = Schema.String.pipe(Schema.minLength(1)).pipe(
  Schema.brand('CustomerId'),
);

/**
 * CustomerName （顧客名）
 * - 1〜50文字
 */
export type CustomerName = typeof CustomerName.Type;
export const CustomerName = Schema.String.pipe(
  Schema.minLength(1, { message: () => '顧客名は必須です' }),
  Schema.maxLength(50, { message: () => '顧客名は50文字以内です' }),
  Schema.brand('CustomerName'),
);

/**
 * CustomerInfo （顧客情報）
 */
export type CustomerInfo = typeof CustomerInfo.Type;
export const CustomerInfo = Schema.Struct({
  id: CustomerId,
  name: CustomerName,
  emailAddress: CustomerEmail,
});

/**
 * UnvalidatedCustomerInfo（未検証の顧客情報）
 * - プリミティブ型のみ
 */
export type UnvalidatedCustomerInfo = {
  id: string;
  name: string;
  emailAddress: string;
};
