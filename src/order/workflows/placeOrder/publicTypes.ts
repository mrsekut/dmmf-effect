/**
 * PlaceOrder Workflow の公開型
 * - ワークフローの入出力として公開される型を定義
 */
import { Data } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { PricedOrder, OrderId, BillingAmount } from '../../Order';
import type { Address } from '../../Address';
import type { EmailAddress } from '../../CustomerEmail';
import type { PricingError } from './GetProductPrice';

// ------------------------------------
// outputs from the workflow (success case)
// ------------------------------------

/**
 * PlaceOrderEvent（注文確定イベント）
 * - ワークフローの出力として発行される可能性のあるすべてのイベント
 */
export type PlaceOrderEvent =
  | OrderPlacedEvent
  | BillableOrderPlacedEvent
  | OrderAcknowledgmentSentEvent;

/**
 * OrderPlaced（注文確定）イベント
 */
export type OrderPlacedEvent = {
  type: 'OrderPlaced';
} & Omit<PricedOrder, 'type'>;

/**
 * BillableOrderPlaced（請求可能な注文確定）イベント
 * - 請求金額が0でない場合のみ生成
 */
export type BillableOrderPlacedEvent = {
  type: 'BillableOrderPlaced';
  orderId: OrderId;
  billingAddress: Address;
  amountToBill: BillingAmount;
};

/**
 * OrderAcknowledgmentSent（確認送信済み）イベント
 * - 確認メールが正常に送信された場合のみ生成
 */
export type OrderAcknowledgmentSentEvent = {
  type: 'AcknowledgmentSent';
  orderId: OrderId;
  emailAddress: EmailAddress;
};

// ------------------------------------
// error outputs
// ------------------------------------

/**
 * PlaceOrderError（注文確定エラー）
 * - ワークフローが失敗したときのエラー型
 */
export type PlaceOrderError = Data.TaggedEnum<{
  Validation: { error: ParseError };
  Pricing: { error: PricingError };
}>;
export const PlaceOrderError = Data.taggedEnum<PlaceOrderError>();
