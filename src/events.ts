/**
 * OrderPlaced Event
 * - 受注コンテキストが発行し、発送コンテキストが購読する
 */
export type OrderPlacedEvent = {
  orderId: string;
  customerId: string;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  orderLines: {
    productId: string;
    quantity: number;
  }[];
};

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
