/**
 * PlaceOrder Workflow の DTO (Data Transfer Object)
 *
 * - 外部（JSON/HTTP）との境界で使用する型
 * - ドメイン型との相互変換関数を提供
 */

import { Match } from 'effect';
import type { UnvalidatedOrder } from './Order';
import type {
  PlaceOrderEvent,
  PlaceOrderError,
  OrderPlacedEvent,
  BillableOrderPlacedEvent,
  OrderAcknowledgmentSentEvent,
} from '../workflows/placeOrder/publicTypes';

// ============================================
// Input DTOs
// ============================================

/**
 * CustomerInfoDto
 * - 外部から受け取る顧客情報
 */
type CustomerInfoDto = {
  firstName: string;
  lastName: string;
  emailAddress: string;
};

/**
 * AddressDto
 * - 外部から受け取る住所情報
 */
type AddressDto = {
  street: string;
  city: string;
  zipCode: string;
};

/**
 * OrderFormLineDto
 * - 外部から受け取る注文明細行
 */
type OrderFormLineDto = {
  orderLineId: string;
  productCode: string;
  quantity: number;
};

/**
 * OrderFormDto
 * - 外部から受け取る注文フォーム（入力DTO）
 */
export type OrderFormDto = {
  orderId: string;
  customerInfo: CustomerInfoDto;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  lines: OrderFormLineDto[];
};

// ============================================
// Input DTO → Domain
// ============================================

/**
 * OrderFormDto → UnvalidatedOrder
 * - DTOからドメインオブジェクトへの変換
 * - バリデーションは行わない（常に成功）
 */
export const toUnvalidatedOrder = (dto: OrderFormDto): UnvalidatedOrder => ({
  orderId: dto.orderId,
  customerInfo: {
    firstName: dto.customerInfo.firstName,
    lastName: dto.customerInfo.lastName,
    emailAddress: dto.customerInfo.emailAddress,
  },
  shippingAddress: {
    street: dto.shippingAddress.street,
    city: dto.shippingAddress.city,
    zipCode: dto.shippingAddress.zipCode,
  },
  billingAddress: {
    street: dto.billingAddress.street,
    city: dto.billingAddress.city,
    zipCode: dto.billingAddress.zipCode,
  },
  orderLines: dto.lines.map(line => ({
    id: line.orderLineId,
    productCode: line.productCode,
    quantity: line.quantity,
  })),
});

// ============================================
// Output DTOs
// ============================================

/**
 * PricedOrderLineDto
 * - 価格計算済み注文明細行のDTO
 */
type PricedOrderLineDto = {
  orderLineId: string;
  productCode: string;
  quantity: number;
  linePrice: number;
};

/**
 * OrderPlacedDto
 * - 注文確定イベントのDTO
 */
type OrderPlacedDto = {
  orderId: string;
  customerInfo: CustomerInfoDto;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  lines: PricedOrderLineDto[];
  amountToBill: number;
};

/**
 * BillableOrderPlacedDto
 * - 請求可能な注文確定イベントのDTO
 */
type BillableOrderPlacedDto = {
  orderId: string;
  billingAddress: AddressDto;
  amountToBill: number;
};

/**
 * OrderAcknowledgmentSentDto
 * - 確認送信済みイベントのDTO
 */
type OrderAcknowledgmentSentDto = {
  orderId: string;
  emailAddress: string;
};

/**
 * PlaceOrderEventDto
 * - F#版と同様にMapスタイルで表現
 * - キーがイベントタイプ、値がイベントデータ
 */
export type PlaceOrderEventDto =
  | { OrderPlaced: OrderPlacedDto }
  | { BillableOrderPlaced: BillableOrderPlacedDto }
  | { AcknowledgmentSent: OrderAcknowledgmentSentDto };

/**
 * PlaceOrderErrorDto
 * - エラーのDTO
 */
export type PlaceOrderErrorDto = {
  code: string;
  message: string;
};

// ============================================
// Domain → Output DTO
// ============================================

const fromCustomerInfo = (
  customerInfo: OrderPlacedEvent['customerInfo'],
): CustomerInfoDto => ({
  firstName: customerInfo.name.firstName,
  lastName: customerInfo.name.lastName,
  emailAddress: customerInfo.emailAddress,
});

const fromAddress = (address: OrderPlacedEvent['shippingAddress']): AddressDto => ({
  street: address.street,
  city: address.city,
  zipCode: address.zipCode,
});

const fromPricedOrderLine = (
  line: OrderPlacedEvent['orderLines'][number],
): PricedOrderLineDto => ({
  orderLineId: line.id,
  productCode: line.productCode.code,
  quantity: line.quantity,
  linePrice: line.price,
});

const fromOrderPlaced = (event: OrderPlacedEvent): OrderPlacedDto => ({
  orderId: event.id,
  customerInfo: fromCustomerInfo(event.customerInfo),
  shippingAddress: fromAddress(event.shippingAddress),
  billingAddress: fromAddress(event.billingAddress),
  lines: event.orderLines.map(fromPricedOrderLine),
  amountToBill: event.amountToBill,
});

const fromBillableOrderPlaced = (
  event: BillableOrderPlacedEvent,
): BillableOrderPlacedDto => ({
  orderId: event.orderId,
  billingAddress: fromAddress(event.billingAddress),
  amountToBill: event.amountToBill,
});

const fromAcknowledgmentSent = (
  event: OrderAcknowledgmentSentEvent,
): OrderAcknowledgmentSentDto => ({
  orderId: event.orderId,
  emailAddress: event.emailAddress,
});

/**
 * PlaceOrderEvent → PlaceOrderEventDto
 */
export const fromPlaceOrderEvent = (event: PlaceOrderEvent): PlaceOrderEventDto => {
  switch (event.type) {
    case 'OrderPlaced':
      return { OrderPlaced: fromOrderPlaced(event) };
    case 'BillableOrderPlaced':
      return { BillableOrderPlaced: fromBillableOrderPlaced(event) };
    case 'AcknowledgmentSent':
      return { AcknowledgmentSent: fromAcknowledgmentSent(event) };
  }
};

/**
 * PlaceOrderError → PlaceOrderErrorDto
 */
export const fromPlaceOrderError = (error: PlaceOrderError): PlaceOrderErrorDto =>
  Match.value(error).pipe(
    Match.discriminatorsExhaustive('_tag')({
      Validation: e => ({
        code: 'ValidationError',
        message: e.error.message,
      }),
      Pricing: e => ({
        code: 'PricingError',
        message: e.error.message,
      }),
      RemoteService: e => ({
        code: 'RemoteServiceError',
        message: `${e.error.service.name}: ${e.error.message}`,
      }),
    }),
  );
