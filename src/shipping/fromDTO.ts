import { Schema } from 'effect';
import * as Domain from './domain';

export type ShipOrderDTO = {
  readonly orderReference: string;
  readonly customerName: string;
  readonly shippingAddress: {
    readonly street: string;
    readonly city: string;
    readonly zipCode: string;
  };
  readonly items: readonly {
    readonly productId: string;
    readonly productName: string;
    readonly quantity: number;
  }[];
};

/**
 * DTO → Domain Object
 * - 検証など
 */
export const fromDTO = (command: ShipOrderDTO) =>
  Schema.decodeUnknown(Domain.Shipment)({
    shipmentId: crypto.randomUUID(),
    orderReference: command.orderReference,
    customerName: command.customerName,
    shippingAddress: command.shippingAddress,
    items: command.items,
    status: 'pending',
    trackingNumber: null,
    shippedAt: null,
  });
