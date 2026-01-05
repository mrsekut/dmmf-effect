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
export const fromDTO = (dto: PlaceOrderDTO) => {
  const orderId = crypto.randomUUID();
  return Schema.decodeUnknown(Domain.ValidatedOrder)({
    type: 'ValidatedOrder',
    id: orderId,
    customerId: dto.customerId,
    shippingAddress: dto.shippingAddress,
    billingAddress: dto.billingAddress,
    orderLines: dto.orderLines.map((line, index) => ({
      id: `${orderId}-line-${index}`,
      orderId: orderId,
      productCode: line.productId,
      quantity: line.quantity,
      price: line.unitPrice,
    })),
    amountToBill: dto.amountToBill,
  });
};
