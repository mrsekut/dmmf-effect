import { Schema } from 'effect';

/**
 * UnitQuantity（個数）
 */
type UnitQuantity = typeof UnitQuantity.Type;
const UnitQuantity = Schema.Int.pipe(
  Schema.greaterThanOrEqualTo(1),
  Schema.lessThanOrEqualTo(1000),
  Schema.brand('UnitQuantity'),
);

/**
 * KilogramQuantity（重量）
 */
type KilogramQuantity = typeof KilogramQuantity.Type;
const KilogramQuantity = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0.05),
  Schema.lessThanOrEqualTo(100.0),
  Schema.brand('KilogramQuantity'),
);

/**
 * OrderQuantity（注文数量）
 */
export type OrderQuantity = typeof OrderQuantity.Type;
export const OrderQuantity = Schema.Union(UnitQuantity, KilogramQuantity);
