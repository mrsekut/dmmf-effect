/**
 * OrderPlaced Event
 * - 受注コンテキストが発行し、発送コンテキストが購読する
 */
export type OrderPlacedEvent = {
  orderId: string;
  customerName: string;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  orderLines: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  placedAt: Date;
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
