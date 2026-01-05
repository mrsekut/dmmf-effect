import { Schema } from 'effect';
import * as Domain from './domain';

export type PlaceOrderDTO = {
  customerId: string;
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
  amountToBill: number;
};

/**
 * DTO → Domain Object
 * - 検証など
 */
export const fromDTO = (dto: PlaceOrderDTO) =>
  Schema.decodeUnknown(Domain.ValidatedOrder)({
    id: crypto.randomUUID(),
    customerId: dto.customerId,
    shippingAddress: dto.shippingAddress,
    billingAddress: dto.billingAddress,
    orderLines: dto.orderLines,
    amountToBill: dto.amountToBill,
  });
