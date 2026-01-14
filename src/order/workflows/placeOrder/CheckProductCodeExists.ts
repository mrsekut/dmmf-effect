import { Effect } from 'effect';
import type { ProductCode } from '../../ProductCode';

/**
 * deps1: CheckProductCodeExists
 *  ローカルで実行され、かつ失敗の可能性もないので、返り値はEffectである必要がない
 */

export class CheckProductCodeExists extends Effect.Service<CheckProductCodeExists>()(
  'CheckProductCodeExists',
  {
    effect: Effect.gen(function* () {
      // dummy
      const check = (_c: ProductCode) => true;
      return { check };
    }),
    accessors: true,
  },
) {}
