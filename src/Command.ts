/**
 * 共通のフィールドとコマンド固有のデータを含むCommand型
 * - Data: コマンド固有のデータ
 * - Timestamp: コマンドのタイムスタンプ
 * - UserId: コマンドを作成したユーザー
 */
export type Command<TData> = {
  readonly data: TData;
  readonly timestamp: Date;
  readonly userId: string;
};
