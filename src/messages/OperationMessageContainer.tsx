import React from "react";
import {
  OperationMessageHandler,
  OperationMessageHandlerAll
} from "./OperationMessageHandler";
import { MessageUtils } from "./MessageUtils";

/**
 * Operation message container properties
 * 操作消息容器属性
 */
export type OperationMessageContainerProps = {
  /**
   * Handler
   * 处理器
   */
  handler: OperationMessageHandlerAll;

  /**
   * Timeout miliseconds
   * 超时毫秒
   */
  timeout?: number;
};

/**
 * Operation message container
 * 操作消息容器
 * @param props Props
 * @returns Component
 */
export function OperationMessageContainer(
  props: OperationMessageContainerProps
) {
  const { handler, timeout = 200 } = props;

  const refs = React.useRef({ seed: 0, mounted: false });

  const resetSeed = () => {
    if (refs.current.seed > 0) {
      clearTimeout(refs.current.seed);
      refs.current.seed = 0;
    }
  };

  React.useEffect(() => {
    const my: OperationMessageHandler =
      typeof handler === "function"
        ? handler
        : (_user, isSelf, message) => {
            const [types, callback, id] = handler;
            if (id == null || id === message.id) {
              // Check types & isSelf
              if (
                isSelf ||
                !types.includes(message.operationType) ||
                !refs.current.mounted
              )
                return;

              resetSeed();

              refs.current.seed = window.setTimeout(callback, timeout);
            }
          };
    MessageUtils.onOperationMessage(my);

    refs.current.mounted = true;

    return () => {
      resetSeed();
      refs.current.mounted = false;

      MessageUtils.offOperationMessage(my);
    };
  }, []);

  return <React.Fragment></React.Fragment>;
}
