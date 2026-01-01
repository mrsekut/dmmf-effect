import { Effect, Schema } from 'effect';

import { ProductCode } from './ProductCode';
import { OrderQuantity } from './OrderQuantity';
import { CustomerInfo } from './CustomerInfo';

/**
 * 注文ID
 * - 空でない文字列
 */
type OrderId = typeof OrderId.Type;
const OrderId = Schema.NonEmptyString.pipe(Schema.brand('OrderId'));

/**
 * BillingAmount（請求金額）
 * - 0以上
 */
type BillingAmount = typeof BillingAmount.Type;
const BillingAmount = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0),
  Schema.brand('BillingAmount'),
);

/**
 * 住所 (Value Object)
 */
type Address = typeof Address.Type;
const Address = Schema.Struct({
  street: Schema.String.pipe(Schema.minLength(1)),
  city: Schema.String.pipe(Schema.minLength(1)),
  zipCode: Schema.String.pipe(Schema.pattern(/^\d{3}-?\d{4}$/)),
}).pipe(Schema.brand('Address'));

/**
 * ShippingAddress（配送先住所）
 * TODO:
 */
type ShippingAddress = typeof ShippingAddress.Type;
const ShippingAddress = Address.pipe(Schema.brand('ShippingAddress'));

/**
 * BillingAddress（請求先住所）
 * TODO:
 */
type BillingAddress = typeof BillingAddress.Type;
const BillingAddress = Address.pipe(Schema.brand('BillingAddress'));

/**
 * 注文明細行 (Entity)
 */
type OrderLine = typeof OrderLine.Type;
const OrderLine = Schema.Struct({
  productCode: ProductCode,
  productName: Schema.String.pipe(Schema.minLength(1)),
  quantity: OrderQuantity,
  unitPrice: BillingAmount,
}).pipe(Schema.brand('OrderLine'));

/**
 * 注文 (Aggregate Root)
 */
export type Order = typeof Order.Type;
export const Order = Schema.Struct({
  orderId: OrderId,
  customerInfo: CustomerInfo,
  shippingAddress: ShippingAddress,
  billingAddress: BillingAddress,
  orderLines: Schema.Array(OrderLine),
  placedAt: Schema.DateFromSelf,
}).pipe(Schema.brand('Order'));

/**
 * UnvalidatedOrder（未検証の注文）
 * - 外部から受け取った生の注文データ
 */
type UnvalidatedOrder = typeof UnvalidatedOrder.Type;
const UnvalidatedOrder = Schema.Struct({
  type: Schema.Literal('UnvalidatedOrder'),
  // TODO:
});

/**
 * ValidatedOrder（検証済みの注文）
 * - すべてのフィールドが検証済み
 */
type ValidatedOrder = typeof ValidatedOrder.Type;
const ValidatedOrder = Schema.Struct({
  type: Schema.Literal('ValidatedOrder'),
  // TODO:
});

/**
 * AcknowledgmentSent（確認送信済み）イベント
 */
type AcknowledgmentSentEvent = typeof AcknowledgmentSentEvent.Type;
const AcknowledgmentSentEvent = Schema.Struct({
  type: Schema.Literal('AcknowledgmentSent'),
  orderId: OrderId,
  emailAddress: Schema.String,
});

/**
 * OrderPlaced（注文確定）イベント
 */
type OrderPlacedEvent = typeof OrderPlacedEvent.Type;
const OrderPlacedEvent = Schema.Struct({
  type: Schema.Literal('OrderPlaced'),
  orderId: OrderId,
  // TODO: events.tsにあるやつかな
});

/**
 * BillableOrderPlaced（請求可能な注文確定）イベント
 */
type BillableOrderPlacedEvent = typeof BillableOrderPlacedEvent.Type;
const BillableOrderPlacedEvent = Schema.Struct({
  type: Schema.Literal('BillableOrderPlaced'),
  orderId: OrderId,
  billingAmount: BillingAmount,
});

/**
 * PlaceOrderEvents（注文確定イベント）
 * - ワークフローが複数の出力を持つ場合、レコード型でまとめる
 */
type PlaceOrderEvents = typeof PlaceOrderEvents.Type;
const PlaceOrderEvents = Schema.Struct({
  acknowledgmentSent: AcknowledgmentSentEvent,
  orderPlaced: OrderPlacedEvent,
  billableOrderPlaced: BillableOrderPlacedEvent,
});

/**
 * PlaceOrder ワークフロー
 * - 生の UnvalidatedOrder を入力として開始し、PlaceOrderEvents を返す
 */
export type PlaceOrder = (uo: UnvalidatedOrder) => PlaceOrderEvents;

/**
 * EnvelopeContents（メールの内容）
 */
type EnvelopeContents = typeof EnvelopeContents.Type;
const EnvelopeContents = Schema.String.pipe(Schema.brand('EnvelopeContents'));

/**
 * QuoteForm（見積依頼フォーム）
 */
type QuoteForm = typeof QuoteForm.Type;
const QuoteForm = Schema.Struct({
  type: Schema.Literal('QuoteForm'),
  // TODO:
});

/**
 * OrderForm（注文フォーム）
 */
type OrderForm = typeof OrderForm.Type;
const OrderForm = Schema.Struct({
  type: Schema.Literal('OrderForm'),
  // TODO:
});

/**
 * CategorizedMail（分類済みのメール）
 * - 出力に複数の選択肢がある場合、選択型を作成
 */
type CategorizedMail = typeof CategorizedMail.Type;
const CategorizedMail = Schema.Union(QuoteForm, OrderForm);

/**
 * CategorizeInboundMail ワークフロー
 * - 受信メールの分類
 */
export type CategorizeInboundMail = (c: EnvelopeContents) => CategorizedMail;

// ============================================
// 複数入力のモデリング
// ============================================

/**
 * ProductCatalog（製品カタログ）
 * - 依存関係として注入される
 */
type ProductCatalog = typeof ProductCatalog.Type;
const ProductCatalog = Schema.Struct({
  type: Schema.Literal('ProductCatalog'),
  // TODO:
});

/**
 * PricedOrder（価格計算済みの注文）
 */
type PricedOrder = typeof PricedOrder.Type;
const PricedOrder = Schema.Struct({
  type: Schema.Literal('PricedOrder'),
  // TODO:
});

/**
 * CalculatePrices ワークフロー（別々のパラメーター版）
 * - ProductCatalogが「本当の」入力ではなく依存関係にあるので、本当はDIしたい
 */
export type CalculatePrices = (
  o: OrderForm,
) => (c: ProductCatalog) => PricedOrder;

/**
 * ValidationError（検証エラー）
 * - エラーの説明とどのフィールドに適用されるかを含む
 */
type ValidationError = typeof ValidationError.Type;
const ValidationError = Schema.Struct({
  fieldName: Schema.String,
  errorDescription: Schema.String,
});

/**
 * ValidationResponse<A>
 * - Effectは非同期処理とエラー処理の両方を表現できる
 */
type ValidationResponse<A> = Effect.Effect<A, ValidationError[]>;

/**
 * ValidateOrderAsync ワークフロー
 */
export type ValidateOrder = (
  uo: UnvalidatedOrder,
) => ValidationResponse<ValidatedOrder>;

// ============================================
// Domain Logic
// ============================================

/**
 * 注文の合計金額を計算
 */
export const calculateTotal = (order: Order) => {
  const total = order.orderLines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  return BillingAmount.make(total);
};
