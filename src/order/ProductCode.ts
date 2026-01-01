import { Schema } from 'effect';

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
