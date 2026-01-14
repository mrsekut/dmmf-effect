import { Array, Effect, Schema, ParseResult, pipe } from 'effect';
import { OrderId, ValidatedOrder, type UnvalidatedOrder } from '../../Order';
import { toAddress, UnvalidatedAddress } from '../../Address';
import { toCustomerInfo } from '../../Customer';
import { OrderLine, toValidatedOrderLine } from '../../OrderLine';
import type { CheckProductCodeExists } from './CheckProductCodeExists';

/**
 * ValidateOrder
 */
type ValidateOrder = (
  uo: UnvalidatedOrder,
) => Effect.Effect<
  ValidatedOrder,
  ParseResult.ParseError,
  CheckAddressExists | CheckProductCodeExists
>;

export const validateOrder: ValidateOrder = uo => {
  return Effect.gen(function* () {
    const id = OrderId.make(uo.orderId);
    const customerInfo = toCustomerInfo(uo.customerInfo);

    const shippingAddress = yield* pipe(
      uo.shippingAddress,
      toCheckedAddress,
      Effect.map(toAddress),
    );
    const billingAddress = yield* pipe(
      uo.billingAddress,
      toCheckedAddress,
      Effect.map(toAddress),
    );

    const orderLines = yield* pipe(
      uo.orderLines,
      Array.map(toValidatedOrderLine),
      Effect.all,
      Effect.flatMap(Schema.decodeUnknown(Schema.NonEmptyArray(OrderLine))),
    );

    return ValidatedOrder.make({
      type: 'ValidatedOrder',
      id,
      customerInfo,
      shippingAddress,
      billingAddress,
      orderLines,
    });
  });
};

function toCheckedAddress(address: UnvalidatedAddress) {
  return Effect.gen(function* () {
    const checkedAddress = yield* CheckAddressExists.check(address);
    // TODO: error handling
    return checkedAddress;
  });
}

/** deps2: CheckAddressExists */
export class CheckAddressExists extends Effect.Service<CheckAddressExists>()(
  'CheckAddressExists',
  {
    effect: Effect.gen(function* () {
      // dummy
      const check = (
        address: UnvalidatedAddress,
      ): Effect.Effect<CheckedAddress, ParseResult.ParseError> =>
        Effect.succeed(CheckedAddress.make(address));

      return { check };
    }),
    accessors: true,
  },
) {}

type CheckedAddress = typeof CheckedAddress.Type;
const CheckedAddress = UnvalidatedAddress.pipe(Schema.brand('CheckedAddress'));
