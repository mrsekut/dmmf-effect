import { Schema } from 'effect';

/**
 * 住所 (Value Object)
 */
export type Address = typeof Address.Type;
export const Address = Schema.Struct({
  street: Schema.String.pipe(Schema.minLength(1)),
  city: Schema.String.pipe(Schema.minLength(1)),
  zipCode: Schema.String.pipe(Schema.pattern(/^\d{3}-?\d{4}$/)),
}).pipe(Schema.brand('Address'));

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

export const toAddress = (checkedAddress: UnvalidatedAddress) => {
  return Address.make({
    street: checkedAddress.street,
    city: checkedAddress.city,
    zipCode: checkedAddress.zipCode,
  });
};
