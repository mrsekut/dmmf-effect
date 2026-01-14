import { Effect, pipe, Schema } from 'effect';
import { CheckProductCodeExists } from './CheckProductCodeExists';
import { parseError, Type } from 'effect/ParseResult';

/**
 * WidgetCode（装置コード）
 * - "W" で始まる4桁のコード
 */
type WidgetCode = typeof WidgetCode.Type;
const WidgetCode = Schema.TaggedStruct('Widget', {
  code: Schema.String.pipe(Schema.pattern(/^W\d{4}$/)),
});

/**
 * GizmoCode（ギズモコード）
 * - "G" で始まる3桁のコード
 */
type GizmoCode = typeof GizmoCode.Type;
const GizmoCode = Schema.TaggedStruct('Gizmo', {
  code: Schema.String.pipe(Schema.pattern(/^G\d{3}$/)),
});

/**
 * ProductCode （商品コード）
 */
export type ProductCode = typeof ProductCode.Type;
export const ProductCode = Schema.Union(WidgetCode, GizmoCode);

/**
 * 文字列からProductCodeへの変換スキーマ
 */
export const ProductCodeFromString = Schema.transformOrFail(
  Schema.String,
  ProductCode,
  {
    strict: true,
    decode: (code, _, ast) => {
      if (/^W\d{4}$/.test(code)) {
        return Effect.succeed(WidgetCode.make({ code }));
      }
      if (/^G\d{3}$/.test(code)) {
        return Effect.succeed(GizmoCode.make({ code }));
      }
      return Effect.fail(
        new Type(ast, code, `Invalid product code format: ${code}`),
      );
    },
    encode: productCode => Effect.succeed(productCode.code),
  },
);

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
    Schema.decodeUnknown(ProductCodeFromString),
    Effect.flatMap(checkProduct),
  );
}
