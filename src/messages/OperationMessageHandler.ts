import { OperationMessageDto } from "./OperationMessageDto";
import { SignalRUser } from "./SignalRUser";

/**
 * Operation message handler type
 * 操作信息处理程序类型
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
) => void | boolean;
