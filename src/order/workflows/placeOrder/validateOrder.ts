import { Context, Effect, Schema } from 'effect';
import { ValidatedOrder, type UnvalidatedOrder } from '../../Order';
import type { ProductCode } from '../../ProductCode';
import { UnvalidatedAddress } from '../../Address';

/**
 * deps1: CheckProductCodeExists
 *  ローカルで実行され、かつ失敗の可能性もないので、返り値はEffectである必要がない
 */
class CheckProductCodeExists extends Context.Tag('CheckProductCodeExists')<
  CheckProductCodeExists,
  {
    readonly checkProductCodeExists: (c: ProductCode) => boolean;
  }
>() {}

/** deps2: CheckAddressExists */
class CheckAddressExists extends Context.Tag('CheckAddressExists')<
  CheckAddressExists,
  {
    readonly checkAddressExists: (
      a: UnvalidatedAddress,
    ) => Effect.Effect<CheckedAddress, AddressValidationError>;
  }
>() {}

type CheckedAddress = typeof CheckedAddress.Type;
const CheckedAddress = UnvalidatedAddress.pipe(Schema.brand('CheckedAddress'));

class AddressValidationError extends Schema.TaggedError<AddressValidationError>()(
  'AddressValidationError',
  { message: Schema.String },
) {}

/**
 * ValidateOrder
 */
export type ValidateOrder = <E>(
  uo: UnvalidatedOrder,
) => Effect.Effect<
  ValidatedOrder,
  E | ValidationError[],
  CheckAddressExists | CheckProductCodeExists
>;

class ValidationError extends Schema.TaggedError<ValidationError>()(
  'ValidationError',
  { message: Schema.String },
) {}

/**
 * ValidateOrder
 * TODO: ValidateOrder を実装する
 * - UnvalidatedOrder → ValidatedOrder
 * - ワークフローの最初のステップ
 */
export const validateOrder = (unvalidatedOrder: UnvalidatedOrder) => {
  const orderId = crypto.randomUUID();

  return Schema.decodeUnknown(ValidatedOrder)({
    type: 'ValidatedOrder',
    id: orderId,
    customerInfo: {
      name: {
        firstName: unvalidatedOrder.customerInfo.firstName,
        lastName: unvalidatedOrder.customerInfo.lastName,
      },
      emailAddress: unvalidatedOrder.customerInfo.emailAddress,
    },
    shippingAddress: unvalidatedOrder.shippingAddress,
    billingAddress: unvalidatedOrder.billingAddress,
    orderLines: unvalidatedOrder.orderLines.map((line, index) => ({
      id: `${orderId}-line-${index}`,
      productCode: line.productCode,
      quantity: line.quantity,
      price: line.price,
    })),
  });
};
