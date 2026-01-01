export * from './PlaceOrder';

/**
 * OrderShipped Event
 * - 発送コンテキストが発行する
 */
export type OrderShippedEvent = {
  orderId: string;
  shipmentId: string;
  shippedAt: Date;
  trackingNumber: string;
};
