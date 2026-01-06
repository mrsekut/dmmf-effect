import { Effect, Schema, Array } from 'effect';

import { ProductCode } from './ProductCode';
import { OrderQuantity } from './OrderQuantity';
import { CustomerInfo, type UnvalidatedCustomerInfo } from './Customer';
import {
  ValidatedShippingAddress,
  ValidatedBillingAddress,
  UnvalidatedAddress,
} from './Address';
import type { PlaceOrderError, PlaceOrderEvents } from '../events/PlaceOrder';
import {
  type UnvalidatedOrderLine,
  OrderLine,
  OrderLineId,
  Price,
} from './OrderLine';

/**
 * 注文ID
 * - 空でない文字列
 */
export type OrderId = typeof OrderId.Type;
export const OrderId = Schema.NonEmptyString.pipe(Schema.brand('OrderId'));

/**
 * BillingAmount（請求金額）
 * - 0以上
 */
export type BillingAmount = typeof BillingAmount.Type;
export const BillingAmount = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0),
  Schema.brand('BillingAmount'),
);

/**
 * UnvalidatedOrder（未検証の注文）
 * - 外部から受け取った生の注文データ
 * - プリミティブ型のみ（string, number等）
 */
export type UnvalidatedOrder = {
  readonly orderId: string;
  readonly customerInfo: UnvalidatedCustomerInfo;
  readonly shippingAddress: UnvalidatedAddress;
  readonly billingAddress: UnvalidatedAddress;
  readonly orderLines: readonly UnvalidatedOrderLine[];
};

/**
 * ValidatedOrder（検証済みの注文）
 * - すべてのフィールドが検証済み
 */
export type ValidatedOrder = typeof ValidatedOrder.Type;
export const ValidatedOrder = Schema.Struct({
  type: Schema.Literal('ValidatedOrder'),
  id: OrderId,
  customerInfo: CustomerInfo,
  shippingAddress: ValidatedShippingAddress,
  billingAddress: ValidatedBillingAddress,
  orderLines: Schema.NonEmptyArray(OrderLine),
});

/**
 * PricedOrder（価格計算済みの注文）
 */
type PricedOrder = typeof PricedOrder.Type;
const PricedOrder = Schema.Struct({
  type: Schema.Literal('PricedOrder'),
  id: OrderId,
  customerInfo: CustomerInfo,
  shippingAddress: ValidatedShippingAddress,
  billingAddress: ValidatedBillingAddress,
  orderLines: Schema.NonEmptyArray(OrderLine),
  amountToBill: BillingAmount,
});

/**
 * 注文 (Aggregate Root)
 */
export type Order = UnvalidatedOrder | ValidatedOrder;

/**
 * PlaceOrder ワークフロー
 * - 「注文確定」プロセス
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
 * CalculatePrices ワークフロー（別々のパラメーター版）
 * - ProductCatalogが「本当の」入力ではなく依存関係にあるので、本当はDIしたい
 */
export type CalculatePrices = (
  o: OrderForm,
) => (c: ProductCatalog) => PricedOrder;

// ============================================
// Domain Logic
// ============================================

export const changeOrderLinePrice = (
  order: PricedOrder,
  lineId: OrderLineId,
  newPrice: Price,
) => {
  const updateLine = (line: OrderLine) =>
    line.id === lineId ? { ...line, price: newPrice } : line;

  const updatedOrder = {
    ...order,
    orderLines: Array.map(order.orderLines, updateLine),
  };

  return PricedOrder.make({
    ...updatedOrder,
    amountToBill: calculateTotal(updatedOrder),
  });
};

/**
 * 注文の合計金額を計算
 */
const calculateTotal = (order: PricedOrder) => {
  const total = order.orderLines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  return BillingAmount.make(total);
};

if (import.meta.vitest) {
  const { describe, test, expect } = import.meta.vitest;

  const createOrderLine = (
    id: string,
    productCode: string,
    quantity: number,
    price: number,
  ) =>
    OrderLine.make({
      id: OrderLineId.make(id),
      productCode: Schema.decodeSync(ProductCode)(productCode),
      quantity: Schema.decodeSync(OrderQuantity)(quantity),
      price: Price.make(price),
    });

  const createAddress = () =>
    ValidatedShippingAddress.make({
      street: 'Test Street',
      city: 'Test City',
      zipCode: '123-4567',
    });

  const createBillingAddress = () =>
    ValidatedBillingAddress.make({
      street: 'Test Street',
      city: 'Test City',
      zipCode: '123-4567',
    });

  const createCustomerInfo = () =>
    Schema.decodeSync(CustomerInfo)({
      name: {
        firstName: 'Test',
        lastName: 'Customer',
      },
      emailAddress: 'test@example.com',
    });

  const createValidatedOrder = (
    orderLines: Array.NonEmptyArray<OrderLine>,
    amountToBill = 0,
  ) =>
    PricedOrder.make({
      type: 'PricedOrder',
      id: OrderId.make('order-1'),
      customerInfo: createCustomerInfo(),
      shippingAddress: createAddress(),
      billingAddress: createBillingAddress(),
      orderLines,
      amountToBill: BillingAmount.make(amountToBill),
    });

  describe('changeOrderLinePrice', () => {
    test('指定したOrderLineのpriceを更新する', () => {
      const line1 = createOrderLine('line-1', 'W1234', 2, 100);
      const line2 = createOrderLine('line-2', 'G123', 3, 200);
      const order = createValidatedOrder([line1, line2], 800);

      const result = changeOrderLinePrice(
        order,
        OrderLineId.make('line-1'),
        Price.make(150),
      );

      const updatedLine = result.orderLines.find(
        l => l.id === OrderLineId.make('line-1'),
      );
      expect(updatedLine?.price).toBe(150);
    });

    test('amountToBillを再計算して更新する', () => {
      const line1 = createOrderLine('line-1', 'W1234', 2, 100);
      const line2 = createOrderLine('line-2', 'G123', 3, 200);
      // 初期: 2*100 + 3*200 = 800
      const order = createValidatedOrder([line1, line2], 800);

      const result = changeOrderLinePrice(
        order,
        OrderLineId.make('line-1'),
        Price.make(150),
      );

      // 更新後: 2*150 + 3*200 = 900
      expect(result.amountToBill).toBe(900);
    });

    test('存在しないlineIdの場合はorderを変更しない', () => {
      const line1 = createOrderLine('line-1', 'W1234', 2, 100);
      const order = createValidatedOrder([line1], 200);

      const result = changeOrderLinePrice(
        order,
        OrderLineId.make('non-existent'),
        Price.make(999),
      );

      expect(result.orderLines[0].price).toBe(100);
      expect(result.amountToBill).toBe(200);
    });
  });

  describe('calculateTotal', () => {
    test('orderLinesの合計金額を計算する', () => {
      const line1 = createOrderLine('line-1', 'W1234', 2, 100);
      const line2 = createOrderLine('line-2', 'G123', 3, 200);
      const order = createValidatedOrder([line1, line2], 0);

      const result = calculateTotal(order);

      // 2*100 + 3*200 = 800
      expect(result).toBe(800);
    });
  });
}
