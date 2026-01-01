import { Schema } from 'effect';

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
  emailAddress: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+$/)),
});

/**
 * UnvalidatedCustomerInfo（未検証の顧客情報）
 * - プリミティブ型のみ
 */
export type UnvalidatedCustomerInfo = typeof UnvalidatedCustomerInfo.Type;
export const UnvalidatedCustomerInfo = Schema.Struct({
  customerId: Schema.String,
  name: Schema.String,
  email: Schema.String,
});
