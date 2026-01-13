import { Effect, pipe, Schema } from 'effect';
import { CheckProductCodeExists } from './CheckProductCodeExists';
import { parseError } from 'effect/ParseResult';

/**
 * WidgetCode（装置コード）
 * - "W" で始まる4桁のコード
 */
type WidgetCode = typeof WidgetCode.Type;
const WidgetCode = Schema.String.pipe(
  Schema.pattern(/^W\d{4}$/),
  Schema.brand('WidgetCode'),
);

/**
 * GizmoCode（ギズモコード）
 * - "G" で始まる3桁のコード
 */
type GizmoCode = typeof GizmoCode.Type;
const GizmoCode = Schema.String.pipe(
  Schema.pattern(/^G\d{3}$/),
  Schema.brand('GizmoCode'),
);

/**
 * ProductCode （商品コード）
 */
export type ProductCode = typeof ProductCode.Type;
export const ProductCode = Schema.Union(WidgetCode, GizmoCode);

export function toProductCode(productCode: string) {
  const checkProduct = (productCode: ProductCode) =>
    Effect.gen(function* () {
      const exists = yield* CheckProductCodeExists.check(productCode);
      if (exists) {
        return productCode;
      } else {
        return yield* Effect.fail(
          parseError({
            _tag: 'Type',
            ast: ProductCode.ast,
            actual: productCode,
            message: `Invalid: ${productCode}`,
          }),
        );
      }
    });

  return pipe(
    productCode,
    Schema.decodeUnknown(ProductCode),
    Effect.flatMap(checkProduct),
  );
}
