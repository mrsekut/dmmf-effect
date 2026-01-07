import { Context, Effect, Schema } from 'effect';
import { ValidatedOrder, PricedOrder } from '../../Order';
import type { ProductCode } from '../../ProductCode';
import type { Price } from '../../OrderLine';

/**
 * deps1: GetProductPrice
 *  ローカルで実行されるが、失敗の可能性はある
 */
class GetProductPrice extends Context.Tag('GetProductPrice')<
  GetProductPrice,
  {
    readonly getProductPrice: (
      c: ProductCode,
    ) => Effect.Effect<Price, PricingError>;
  }
>() {}

class PricingError extends Schema.TaggedError<PricingError>()('PricingError', {
  message: Schema.String,
}) {}

export type PriceOrder = <E>(
  o: ValidatedOrder,
) => Effect.Effect<PricedOrder, E | PricingError, GetProductPrice>;
