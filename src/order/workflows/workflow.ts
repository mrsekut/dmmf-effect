import { Effect } from 'effect';
import { OrderEventQueue } from '../../queues';
import { placeOrderWorkflow } from './placeOrder';
import type { PlaceOrderCommand } from './placeOrder/command';
import type { ChangeOrderCommand } from './changeOrder/command';
import type { CancelOrderCommand } from './cancelOrder/command';

type OrderTakingCommand =
  | { readonly type: 'Place'; readonly command: PlaceOrderCommand }
  | { readonly type: 'Change'; readonly command: ChangeOrderCommand }
  | { readonly type: 'Cancel'; readonly command: CancelOrderCommand };

export const handleOrderTakingCommand = (
  command: OrderTakingCommand,
): Effect.Effect<unknown, unknown, OrderEventQueue> => {
  switch (command.type) {
    case 'Place':
      return placeOrderWorkflow(command.command);
    case 'Change':
      return Effect.fail(new Error('ChangeOrder workflow not implemented'));
    case 'Cancel':
      return Effect.fail(new Error('CancelOrder workflow not implemented'));
  }
};
