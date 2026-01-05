import { Schema } from 'effect';
import { OrderQuantity } from './OrderQuantity';
import { ProductCode } from './ProductCode';

/**
 * Price（価格）
 * - 0以上
 */
export type Price = typeof Price.Type;
export const Price = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0),
  Schema.brand('Price'),
);

/**
 * 注文明細行 (Entity)
 */

export type OrderLineId = typeof OrderLineId.Type;
export const OrderLineId = Schema.String.pipe(Schema.minLength(1)).pipe(
  Schema.brand('OrderLineId'),
);

export type OrderLine = typeof OrderLine.Type;
export const OrderLine = Schema.Struct({
  id: OrderLineId,
  productCode: ProductCode,
  quantity: OrderQuantity,
  price: Price,
}).pipe(Schema.brand('OrderLine'));

export type UnvalidatedOrderLine = {
  productCode: string;
  quantity: number;
  price: number;
};
