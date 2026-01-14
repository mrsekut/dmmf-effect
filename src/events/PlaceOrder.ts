import type { PricedOrder } from '../order';
import type { BillableOrderPlacedEvent } from '../order/workflows/placeOrder';
import type { OrderAcknowledgmentSentEvent } from '../order/workflows/placeOrder/acknowledgeOrder';

/**
 * OrderPlaced（注文確定）イベント
 * - F#: type OrderPlaced = PricedOrder
 * - 現在はPricingステップ未実装のためValidatedOrderを使用
 */
export type OrderPlacedEvent = {
  type: 'OrderPlaced';
} & Omit<PricedOrder, 'type'>;

/**
 * PlaceOrderEvent（注文確定イベント）
 */
export type PlaceOrderEvent =
  | OrderPlacedEvent
  | BillableOrderPlacedEvent
  | OrderAcknowledgmentSentEvent;

/**
 * ValidationError（検証エラー）
 * - エラーの説明とどのフィールドに適用されるかを含む
 */
type ValidationError = {
  type: 'ValidationError';
  fieldName: string;
  errorDescription: string;
};

/**
 * PlaceOrderError（注文確定エラー）
 * - ワークフローが失敗したときのエラー型
 */
export type PlaceOrderError = ValidationError[]; // | TODO:;
