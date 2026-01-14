import type { Shipment } from './Shipping';
import type { OrderShippedEvent } from './publicTypes';

/**
 * Domain Object → Event DTO
 */
export const toOrderShippedEvent = (shipment: Shipment) => {
  if (shipment.status !== 'shipped') {
    return null;
  }

  return {
    orderId: shipment.orderReference,
    shipmentId: shipment.shipmentId,
    shippedAt: shipment.shippedAt,
    trackingNumber: shipment.trackingNumber,
  } as const satisfies OrderShippedEvent;
};
