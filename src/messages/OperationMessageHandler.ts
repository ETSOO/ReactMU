import { OperationMessageDto } from "./OperationMessageDto";
import { SignalRUser } from "./SignalRUser";

/**
 * Operation message handler type
 * 操作消息处理程序类型
 */
export type OperationMessageHandler = (
  /**
   * Signal user data
   */
  user: SignalRUser | undefined,

  /**
   * Is current self user
   */
  isSelf: boolean,

  /**
   * Message
   */
  message: OperationMessageDto
) => void;

/**
 * Operation message handler type for pages
 * 操作消息处理程序类型（页面）
 */
export type OperationMessageHandlerAll =
  | [types: string[], handler: () => void]
  | [types: string[], handler: () => void, id: number]
  | OperationMessageHandler;
