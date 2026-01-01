import type { OrderPlacedEvent } from '../events';
import type { Order } from './domain';

/**
 * Domain Object → DTO
 * - 外部に漏らすべきない情報を落とすなど
 */
export const toDTO = (order: Order) =>
  ({
    orderId: order.orderId,
    customerName: order.customerInfo.name,
    shippingAddress: order.shippingAddress,
    orderLines: order.orderLines.map(l => ({
      productId: l.productCode,
      productName: l.productName,
      quantity: l.quantity,
    })),
    placedAt: order.placedAt,
  }) as const satisfies OrderPlacedEvent;
