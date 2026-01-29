import { Effect, Schema } from 'effect';
import { mkOrderQuantity, OrderQuantity } from './OrderQuantity';
import { ProductCode, toProductCode } from './ProductCode';
import { GetProductPrice } from '../workflows/placeOrder/GetProductPrice';

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

export type UnvalidatedOrderLine = {
  id: string;
  productCode: string;
  quantity: number;
};

export type OrderLine = typeof OrderLine.Type;
export const OrderLine = Schema.Struct({
  id: OrderLineId,
  productCode: ProductCode,
  quantity: OrderQuantity,
}).pipe(Schema.brand('OrderLine'));

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

export type PricedOrderLine = typeof PricedOrderLine.Type;
export const PricedOrderLine = Schema.Struct({
  id: OrderLineId,
  productCode: ProductCode,
  quantity: OrderQuantity,
  price: Price,
}).pipe(Schema.brand('PricedOrderLine'));

export function toPricedOrderLine(ol: OrderLine) {
  return Effect.gen(function* () {
    const price = yield* GetProductPrice.get(ol.productCode);
    const totalPrice = Price.make(ol.quantity * price);

    return PricedOrderLine.make({
      id: ol.id,
      productCode: ol.productCode,
      quantity: ol.quantity,
      price: totalPrice,
    });
  });
}
