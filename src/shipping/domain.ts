import { Schema } from 'effect';
import { CustomerName, ProductCode, OrderQuantity } from '../order';

/**
 * 発送ID
 */
export type ShipmentId = typeof ShipmentId.Type;
export const ShipmentId = Schema.String.pipe(Schema.brand('ShipmentId'));

/**
 * 注文ID（受注コンテキストから受け取った参照）
 * - 発送コンテキストと受注コンテキストで共有する型
 */
export type OrderReference = typeof OrderReference.Type;
export const OrderReference = Schema.String.pipe(
  Schema.brand('OrderReference'),
);

/**
 * 追跡番号
 */
export type TrackingNumber = typeof TrackingNumber.Type;
export const TrackingNumber = Schema.String.pipe(
  Schema.brand('TrackingNumber'),
);

/**
 * 発送先住所
 * - 発送コンテキストでの表現
 * - (注文と発送は Shared Kernel の関係である)
 */
export type ShippingAddress = typeof ShippingAddress.Type;
export const ShippingAddress = Schema.Struct({
  street: Schema.String.pipe(Schema.minLength(1)),
  city: Schema.String.pipe(Schema.minLength(1)),
  zipCode: Schema.String.pipe(Schema.pattern(/^\d{3}-?\d{4}$/)),
}).pipe(Schema.brand('ShippingAddress'));

/**
 * 発送品目
 */
export type ShipmentItem = typeof ShipmentItem.Type;
export const ShipmentItem = Schema.Struct({
  productId: ProductCode,
  productName: Schema.String.pipe(Schema.minLength(1)),
  quantity: OrderQuantity,
}).pipe(Schema.brand('ShipmentItem'));

/**
 * 発送 (Aggregate Root)
 */
type PendingShipment = typeof PendingShipment.Type;
const PendingShipment = Schema.Struct({
  status: Schema.Literal('pending'),
  shipmentId: ShipmentId,
  orderReference: OrderReference,
  customerName: CustomerName,
  shippingAddress: ShippingAddress,
  items: Schema.Array(ShipmentItem),
});

type ShippedShipment = typeof ShippedShipment.Type;
const ShippedShipment = Schema.Struct({
  status: Schema.Literal('shipped'),
  shipmentId: ShipmentId,
  orderReference: OrderReference,
  customerName: CustomerName,
  shippingAddress: ShippingAddress,
  items: Schema.Array(ShipmentItem),
  trackingNumber: TrackingNumber,
  shippedAt: Schema.DateFromSelf,
});

type DeliveredShipment = typeof DeliveredShipment.Type;
const DeliveredShipment = Schema.Struct({
  status: Schema.Literal('delivered'),
  shipmentId: ShipmentId,
  orderReference: OrderReference,
  customerName: CustomerName,
  shippingAddress: ShippingAddress,
  items: Schema.Array(ShipmentItem),
  trackingNumber: TrackingNumber,
  shippedAt: Schema.DateFromSelf,
});

export type Shipment = typeof Shipment.Type;
export const Shipment = Schema.Union(
  PendingShipment,
  ShippedShipment,
  DeliveredShipment,
);

// ============================================
// Domain Logic
// ============================================

/**
 * 追跡番号を生成
 */
const generateTrackingNumber = () => {
  const prefix = 'TRK';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return TrackingNumber.make(`${prefix}-${random}`);
};

/**
 * 発送を完了状態に更新
 */
export const markAsShipped = (shipment: Shipment) =>
  ({
    ...shipment,
    status: 'shipped',
    trackingNumber: generateTrackingNumber(),
    shippedAt: new Date(),
  }) as const satisfies ShippedShipment;
