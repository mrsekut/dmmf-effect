import { Array, Effect, pipe } from 'effect';
import { ValidatedOrder, PricedOrder, BillingAmount } from '../../Order';
import type { GetProductPrice, PricingError } from './GetProductPrice';
import { toPricedOrderLine } from '../../OrderLine';

type PriceOrder = (
  o: ValidatedOrder,
) => Effect.Effect<PricedOrder, PricingError, GetProductPrice>;

export const priceOrder: PriceOrder = vo => {
  return Effect.gen(function* () {
    const orderLines = yield* pipe(
      vo.orderLines,
      Array.map(toPricedOrderLine),
      Effect.all,
    );

    const amountToBill = pipe(
      orderLines,
      Array.reduce(0, (acc, line) => acc + line.price),
      BillingAmount.make,
    );

    return PricedOrder.make({
      type: 'PricedOrder',
      id: vo.id,
      customerInfo: vo.customerInfo,
      shippingAddress: vo.shippingAddress,
      billingAddress: vo.billingAddress,
      orderLines,
      amountToBill,
    });
  });
};
