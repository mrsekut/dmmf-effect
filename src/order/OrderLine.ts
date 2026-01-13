import { Effect, Schema } from 'effect';
import { mkOrderQuantity, OrderQuantity } from './OrderQuantity';
import { ProductCode, toProductCode } from './ProductCode';

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
}).pipe(Schema.brand('OrderLine'));

export type UnvalidatedOrderLine = {
  id: string;
  productCode: string;
  quantity: number;
};

export function toValidatedOrderLine(uol: UnvalidatedOrderLine) {
  return Effect.gen(function* () {
    const id = OrderLineId.make(uol.id);
    const productCode = yield* toProductCode(uol.productCode);
    const quantity = mkOrderQuantity(productCode, uol.quantity);

    return OrderLine.make({
      id,
      productCode,
      quantity,
    });
  });
}
