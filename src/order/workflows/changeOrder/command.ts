import type { Command } from '../../../Command';

/**
 * ChangeOrderCommand（注文変更コマンド）
 */
export type ChangeOrderCommand = Command<{
  readonly orderId: string;
}>;
