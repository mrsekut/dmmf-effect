import { Effect, Schema } from 'effect';
import type { ProductCode } from '../../models/ProductCode';
import { Price } from '../../models/OrderLine';

/**
 *  ローカルで実行されるが、失敗の可能性はある
 */
export class GetProductPrice extends Effect.Service<GetProductPrice>()(
  'GetProductPrice',
  {
    effect: Effect.gen(function* () {
      // dummy
      const get = (_c: ProductCode): Effect.Effect<Price, PricingError> =>
        Effect.succeed(Price.make(100));
      return { get };
    }),
    accessors: true,
  },
) { }

export class PricingError extends Schema.TaggedError<PricingError>()(
  'PricingError',
  {
    message: Schema.String,
  },
) { }
