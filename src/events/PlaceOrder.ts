import type { BillingAmount, OrderId, PricedOrder } from '../order';
import type { Address } from '../order/Address';
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
 * BillableOrderPlaced（請求可能な注文確定）イベント
 */
type BillableOrderPlacedEvent = {
  type: 'BillableOrderPlaced';
  orderId: OrderId;
  billingAddress: Address;
  amountToBill: BillingAmount;
};

/**
 * PlaceOrderEvent（注文確定イベント）
 */
export type PlaceOrderEvent =
  | OrderAcknowledgmentSentEvent
  | OrderPlacedEvent
  | BillableOrderPlacedEvent;

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
