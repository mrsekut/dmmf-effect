import type { Command } from '../../../Command';

/**
 * CancelOrderCommand（注文キャンセルコマンド）
 */
export type CancelOrderCommand = Command<{
  readonly orderId: string;
  readonly reason: string;
}>;
