import EventEmitter from "node:events";
import { SignalRUser } from "./SignalRUser";
import { OperationMessageDto } from "./OperationMessageDto";
import { OperationMessageHandler } from "./OperationMessageHandler";

/**
 * Message utilities
 * 消息工具
 */
export namespace MessageUtils {
  /**
   * Event emitter
   */
  export const eventEmitter = new EventEmitter();

  const OperationMessageName = "onOperationMessage";
  const RefreshName = "onRefresh";

  /**
   * Emit operation message
   * 发出操作信息
   * @param seed Refresh seed
   */
  export function emitOperationMessage(
    user: SignalRUser | undefined,
    isSelf: boolean,
    message: OperationMessageDto
  ) {
    eventEmitter.emit(OperationMessageName, user, isSelf, message);
  }

  /**
   * Emit refresh
   * 发出刷新
   * @param user SignalR user
   * @param isSelf Is current user self
   * @param message Message
   */
  export function emitRefresh() {
    eventEmitter.emit(RefreshName);
  }

  /**
   * Add operation event listener
   * 添加操作事件监控器
   * @param handler Handler
   */
  export function onOperationMessage(handler: OperationMessageHandler) {
    eventEmitter.on(OperationMessageName, handler);
  }

  /**
   * Add refresh event listener
   * 添加事件事件监控器
   * @param handler Handler
   */
  export function onRefresh(handler: OperationMessageHandler) {
    eventEmitter.on(RefreshName, handler);
  }

  /**
   * Remove operation event listener
   * 移除操作事件监控器
   * @param handler Handler
   */
  export function offOperationMessage(handler: OperationMessageHandler) {
    eventEmitter.off(OperationMessageName, handler);
  }

  /**
   * Remove refresh event listener
   * 移除刷新事件监控器
   * @param handler Handler
   */
  export function offRefresh(handler: OperationMessageHandler) {
    eventEmitter.off(RefreshName, handler);
  }
}
