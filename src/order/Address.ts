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
 * TODO:
 */
export type ShippingAddress = typeof ShippingAddress.Type;
export const ShippingAddress = Address.pipe(Schema.brand('ShippingAddress'));

/**
 * BillingAddress（請求先住所）
 * TODO:
 */
export type BillingAddress = typeof BillingAddress.Type;
export const BillingAddress = Address.pipe(Schema.brand('BillingAddress'));

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
