import { Schema } from 'effect';
import * as Domain from './Shipping';

export type ShipOrderDTO = {
  readonly orderReference: string;
  readonly customerInfo: {
    readonly firstName: string;
    readonly lastName: string;
    readonly emailAddress: string;
  };
  readonly shippingAddress: {
    readonly street: string;
    readonly city: string;
    readonly zipCode: string;
  };
  readonly items: readonly {
    readonly productId: string;
    readonly quantity: number;
  }[];
};

/**
 * DTO → Domain Object
 * - 検証など
 */
export const fromDTO = (command: ShipOrderDTO) =>
  Schema.decodeUnknown(Domain.Shipment)({
    status: 'pending',
    shipmentId: crypto.randomUUID(),
    orderReference: command.orderReference,
    customerInfo: {
      name: {
        firstName: command.customerInfo.firstName,
        lastName: command.customerInfo.lastName,
      },
      emailAddress: command.customerInfo.emailAddress,
    },
    shippingAddress: command.shippingAddress,
    items: command.items,
  });
