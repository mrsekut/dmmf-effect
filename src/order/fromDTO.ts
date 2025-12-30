import { Schema } from 'effect';
import * as Domain from './domain';

export type PlaceOrderDTO = {
  customerName: string;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  orderLines: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
};

/**
 * DTO → Domain Object
 * - 検証など
 */
export const fromDTO = (dto: PlaceOrderDTO) =>
  Schema.decodeUnknown(Domain.Order)({
    orderId: crypto.randomUUID(),
    customerName: dto.customerName,
    shippingAddress: dto.shippingAddress,
    billingAddress: dto.billingAddress,
    orderLines: dto.orderLines.map(l => ({
      productId: l.productId,
      productName: l.productName,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    placedAt: new Date(),
  });
