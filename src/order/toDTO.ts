import type { OrderPlacedEvent } from '../events';
import type { ValidatedOrder } from './Order';

/**
 * Domain Object → DTO
 * - 外部に漏らすべきない情報を落とすなど
 */
export const toDTO = (order: ValidatedOrder) =>
  ({
    type: 'OrderPlaced',
    orderId: order.id,
    customerId: order.customerInfo.id,
    shippingAddress: order.shippingAddress,
    orderLines: order.orderLines.map(l => ({
      productId: l.productCode,
      quantity: l.quantity,
    })),
  }) as const satisfies OrderPlacedEvent;
