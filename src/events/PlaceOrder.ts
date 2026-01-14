import { Data } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { PricedOrder } from '../order';
import type { PricingError } from '../order/GetProductPrice';
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
 * PlaceOrderError（注文確定エラー）
 * - ワークフローが失敗したときのエラー型
 */
export type PlaceOrderError = Data.TaggedEnum<{
  Validation: { error: ParseError };
  Pricing: { error: PricingError };
}>;
export const PlaceOrderError = Data.taggedEnum<PlaceOrderError>();
