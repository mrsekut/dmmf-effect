import { Schema } from 'effect';

/**
 * 注文ID
 * - 空でない文字列
 */
export type OrderId = typeof OrderId.Type;
export const OrderId = Schema.NonEmptyString.pipe(Schema.brand('OrderId'));

/**
 * 顧客名
 * - 1〜50文字
 */
export type CustomerName = typeof CustomerName.Type;
export const CustomerName = Schema.String.pipe(
  Schema.minLength(1, { message: () => '顧客名は必須です' }),
  Schema.maxLength(50, { message: () => '顧客名は50文字以内です' }),
  Schema.brand('CustomerName'),
);

/**
 * 商品ID
 */
export type ProductId = typeof ProductId.Type;
export const ProductId = Schema.String.pipe(Schema.brand('ProductId'));

/**
 * 数量
 * - 正の整数
 */
export type Quantity = typeof Quantity.Type;
export const Quantity = Schema.Int.pipe(Schema.brand('Quantity'));

/**
 * 金額
 * - 0以上
 */
export type Amount = typeof Amount.Type;
export const Amount = Schema.Int.pipe(Schema.brand('Amount'));

/**
 * 住所 (Value Object)
 */
export type Address = typeof Address.Type;
export const Address = Schema.Struct({
  street: Schema.String.pipe(Schema.minLength(1)),
  city: Schema.String.pipe(Schema.minLength(1)),
  zipCode: Schema.String.pipe(Schema.pattern(/^\d{3}-?\d{4}$/)),
}).pipe(Schema.brand('Address'));

/**
 * 注文明細行 (Entity)
 */
export type OrderLine = typeof OrderLine.Type;
export const OrderLine = Schema.Struct({
  productId: ProductId,
  productName: Schema.String.pipe(Schema.minLength(1)),
  quantity: Quantity,
  unitPrice: Amount,
}).pipe(Schema.brand('OrderLine'));

/**
 * 注文 (Aggregate Root)
 */
export type Order = typeof Order.Type;
export const Order = Schema.Struct({
  orderId: OrderId,
  customerName: CustomerName,
  shippingAddress: Address,
  billingAddress: Address,
  orderLines: Schema.Array(OrderLine),
  placedAt: Schema.DateFromSelf,
}).pipe(Schema.brand('Order'));

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
  return Amount.make(total);
};
