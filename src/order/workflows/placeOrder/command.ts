import type { Command } from '../../../Command';
import type { UnvalidatedOrder } from '../../models/Order';

/**
 * PlaceOrderCommand（注文確定コマンド）
 * - ワークフローの本当の入力はコマンド
 * - コマンドには、ワークフローがリクエストを処理するために必要なすべての内容が含まれている
 */

export type PlaceOrderCommand = Command<UnvalidatedOrder>;
