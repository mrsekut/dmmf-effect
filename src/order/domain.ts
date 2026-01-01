import { Effect, Schema } from 'effect';

import { ProductCode } from './ProductCode';
import { OrderQuantity } from './OrderQuantity';
import { CustomerId } from './CustomerInfo';

/**
 * 注文ID
 * - 空でない文字列
 */
type OrderId = typeof OrderId.Type;
const OrderId = Schema.NonEmptyString.pipe(Schema.brand('OrderId'));

/**
 * Price（価格）
 * - 0以上
 */
type Price = typeof Price.Type;
const Price = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0),
  Schema.brand('Price'),
);

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
type OrderLineId = typeof OrderLineId.Type;
const OrderLineId = Schema.String.pipe(Schema.minLength(1)).pipe(
  Schema.brand('OrderLineId'),
);

type OrderLine = typeof OrderLine.Type;
const OrderLine = Schema.Struct({
  id: OrderLineId,
  orderId: OrderId,
  productCode: ProductCode,
  quantity: OrderQuantity,
  price: Price,
}).pipe(Schema.brand('OrderLine'));

/**
 * 注文 (Aggregate Root)
 */
export type Order = typeof Order.Type;
export const Order = Schema.Struct({
  id: OrderId,
  customerId: CustomerId,
  shippingAddress: ShippingAddress,
  billingAddress: BillingAddress,
  orderLines: Schema.Array(OrderLine),
  amountToBill: BillingAmount,
}).pipe(Schema.brand('Order'));

/**
 * UnvalidatedOrderLine（未検証の注文明細行）
 * - プリミティブ型のみ
 */
type UnvalidatedOrderLine = typeof UnvalidatedOrderLine.Type;
const UnvalidatedOrderLine = Schema.Struct({
  productCode: Schema.String,
  quantity: Schema.Number,
});

/**
 * UnvalidatedAddress（未検証の住所）
 * - プリミティブ型のみ
 */
type UnvalidatedAddress = typeof UnvalidatedAddress.Type;
const UnvalidatedAddress = Schema.Struct({
  street: Schema.String,
  city: Schema.String,
  zipCode: Schema.String,
});

/**
 * UnvalidatedCustomerInfo（未検証の顧客情報）
 * - プリミティブ型のみ
 */
type UnvalidatedCustomerInfo = typeof UnvalidatedCustomerInfo.Type;
const UnvalidatedCustomerInfo = Schema.Struct({
  customerId: Schema.String,
  name: Schema.String,
  email: Schema.String,
});

/**
 * UnvalidatedOrder（未検証の注文）
 * - 外部から受け取った生の注文データ
 * - プリミティブ型のみ（string, number等）
 */
type UnvalidatedOrder = typeof UnvalidatedOrder.Type;
const UnvalidatedOrder = Schema.Struct({
  orderId: Schema.String,
  customerInfo: UnvalidatedCustomerInfo,
  shippingAddress: UnvalidatedAddress,
  billingAddress: UnvalidatedAddress,
  orderLines: Schema.Array(UnvalidatedOrderLine),
});

/**
 * ValidatedOrder（検証済みの注文）
 * - すべてのフィールドが検証済み
 */
export type ValidatedOrder = typeof ValidatedOrder.Type;
export const ValidatedOrder = Schema.Struct({
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
 * - ワークフローが成功したときのイベント型
 * - ワークフローが複数の出力を持つ場合、レコード型でまとめる
 */
type PlaceOrderEvents = typeof PlaceOrderEvents.Type;
const PlaceOrderEvents = Schema.Struct({
  acknowledgmentSent: AcknowledgmentSentEvent,
  orderPlaced: OrderPlacedEvent,
  billableOrderPlaced: BillableOrderPlacedEvent,
});

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
 * PlaceOrderError（注文確定エラー）
 * - ワークフローが失敗したときのエラー型
 */
type PlaceOrderError = typeof PlaceOrderError.Type;
const PlaceOrderError = Schema.Union(
  Schema.Struct({
    type: Schema.Literal('ValidationError'),
    errors: Schema.Array(ValidationError),
  }),
  Schema.Struct({
    type: Schema.Literal('PricingError'),
    message: Schema.String,
  }),
  Schema.Struct({
    type: Schema.Literal('ServiceError'),
    message: Schema.String,
  }),
);

/**
 * PlaceOrder ワークフロー
 * - 「注文確定」プロセス
 * - UnvalidatedOrder -> Result<PlaceOrderEvents, PlaceOrderError>
 */
export type PlaceOrder = (
  uo: UnvalidatedOrder,
) => Effect.Effect<PlaceOrderEvents, PlaceOrderError>;

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

// ============================================
// Domain Logic
// ============================================

/**
 * 注文の合計金額を計算
 */
export const calculateTotal = (order: Order) => {
  const total = order.orderLines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  return BillingAmount.make(total);
};

export const changeOrderLinePrice = (
  order: Order,
  lineId: OrderLineId,
  newPrice: BillingAmount,
) => {
  return order.orderLines.map(line =>
    line.id === lineId ? { ...line, unitPrice: newPrice } : line,
  );
};
