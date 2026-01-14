import { Option, Effect, Schema, Match, Data, pipe } from 'effect';
import { PricedOrder, OrderId } from '../../Order';
import type { EmailAddress } from '../../CustomerEmail';

type AcknowledgeOrder = (
  o: PricedOrder,
) => Effect.Effect<
  Option.Option<OrderAcknowledgmentSentEvent>,
  never,
  CreateOrderAcknowledgementLetter | SendOrderAcknowledgement
>;

export const acknowledgeOrder: AcknowledgeOrder = po => {
  return Effect.gen(function* () {
    const letter = yield* CreateOrderAcknowledgementLetter.create(po);
    const acknowledgment = {
      emailAddress: po.customerInfo.emailAddress,
      letter,
    };

    const acknowledgmentSent =
      yield* SendOrderAcknowledgement.send(acknowledgment);

    return pipe(
      Match.value(acknowledgmentSent),
      Match.discriminatorsExhaustive('_tag')({
        Sent: () =>
          Option.some({
            type: 'AcknowledgmentSent',
            orderId: po.id,
            emailAddress: po.customerInfo.emailAddress,
          } as const satisfies OrderAcknowledgmentSentEvent),
        NotSent: () => Option.none(),
      }),
    );
  });
};

/**
 * deps1: CreateOrderAcknowledgementLetter
 * - ローカルで実行され、失敗の可能性もない
 */
class CreateOrderAcknowledgementLetter extends Effect.Service<CreateOrderAcknowledgementLetter>()(
  'CreateOrderAcknowledgementLetter',
  {
    effect: Effect.gen(function* () {
      // dummy
      const create = (_o: PricedOrder) => Effect.succeed(HtmlString.make(''));

      return { create };
    }),
    accessors: true,
  },
) {}

type HtmlString = typeof HtmlString.Type;
const HtmlString = Schema.String.pipe(Schema.brand('HtmlString'));

/**
 * deps2: SendOrderAcknowledgement
 * - I/O処理があり、失敗の可能性があるが、エラーの詳細は気にしないのでResultは不要
 */
class SendOrderAcknowledgement extends Effect.Service<SendOrderAcknowledgement>()(
  'SendOrderAcknowledgement',
  {
    effect: Effect.gen(function* () {
      // dummy
      const send = (_o: OrderAcknowledgment): Effect.Effect<SendResult> =>
        Effect.succeed(SendResult.Sent());

      return { send };
    }),
    accessors: true,
  },
) {}

type OrderAcknowledgment = {
  emailAddress: EmailAddress;
  letter: HtmlString;
};

type SendResult = Data.TaggedEnum<{
  Sent: {};
  NotSent: {};
}>;
const SendResult = Data.taggedEnum<SendResult>();

/**
 * AcknowledgmentSent（確認送信済み）イベント
 */
export type OrderAcknowledgmentSentEvent = {
  type: 'AcknowledgmentSent';
  orderId: OrderId;
  emailAddress: EmailAddress;
};
