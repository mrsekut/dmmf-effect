import { Schema } from 'effect';

/**
 * 住所 (Value Object)
 */
type Address = typeof Address.Type;
const Address = Schema.Struct({
  street: Schema.String.pipe(Schema.minLength(1)),
  city: Schema.String.pipe(Schema.minLength(1)),
  zipCode: Schema.String.pipe(Schema.pattern(/^\d{3}-?\d{4}$/)),
}).pipe(Schema.brand('Address'));

/**
 * ShippingAddress（配送先住所）
 */
export type ValidatedShippingAddress = typeof ValidatedShippingAddress.Type;
export const ValidatedShippingAddress = Address.pipe(
  Schema.brand('ValidatedShippingAddress'),
);

/**
 * BillingAddress（請求先住所）
 */
export type ValidatedBillingAddress = typeof ValidatedBillingAddress.Type;
export const ValidatedBillingAddress = Address.pipe(
  Schema.brand('BillingAddress'),
);

/**
 * UnvalidatedAddress（未検証の住所）
 * - プリミティブ型のみ
 */
export type UnvalidatedAddress = typeof UnvalidatedAddress.Type;
export const UnvalidatedAddress = Schema.Struct({
  street: Schema.String,
  city: Schema.String,
  zipCode: Schema.String,
});
