/**
 * Operation message data
 * 操作信息数据
 */
export type OperationMessageDto = {
  /**
   * Operation type
   * 操作类型
   */
  operationType: string;

  /**
   * Target object id
   * 目标对象编号
   */
  id?: number;
};
