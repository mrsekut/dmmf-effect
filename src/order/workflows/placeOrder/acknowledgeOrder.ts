import { Option, Context, Effect, Schema } from 'effect';
import { PricedOrder, OrderId } from '../../Order';
import type { EmailAddress } from '../../CustomerEmail';

/**
 * deps1: CreateOrderAcknowledgementLetter
 *  ローカルで実行され、失敗の可能性もない
 */
class CreateOrderAcknowledgementLetter extends Context.Tag(
  'CreateOrderAcknowledgementLetter',
)<
  CreateOrderAcknowledgementLetter,
  {
    readonly createOrderAcknowledgementLetter: (o: PricedOrder) => HtmlString;
  }
>() {}

type HtmlString = typeof HtmlString.Type;
const HtmlString = Schema.String.pipe(Schema.brand('HtmlString'));

/**
 * deps2: SendOrderAcknowledgement
 * - I/O処理があり、失敗の可能性があるが、エラーの詳細は気にしないのでResultは不要
 */
class SendOrderAcknowledgement extends Context.Tag('SendOrderAcknowledgement')<
  SendOrderAcknowledgement,
  {
    readonly sendOrderAcknowledgement: (
      o: OrderAcknowledgment,
    ) => Effect.Effect<OrderAcknowledgmentSentEvent>;
  }
>() {}

type OrderAcknowledgment = {
  emailAddress: EmailAddress;
  letter: HtmlString;
};

/**
 * AcknowledgmentSent（確認送信済み）イベント
 */
export type OrderAcknowledgmentSentEvent = {
  type: 'AcknowledgmentSent';
  orderId: OrderId;
  emailAddress: EmailAddress;
};

export type AcknowledgeOrder = <E>(
  o: PricedOrder,
) => Effect.Effect<
  Option.Option<OrderAcknowledgmentSentEvent>,
  E,
  CreateOrderAcknowledgementLetter | SendOrderAcknowledgement
>;
