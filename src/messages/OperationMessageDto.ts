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
   * Device id
   * 设备编号
   */
  deviceId: number;

  /**
   * Target object id
   * 目标对象编号
   */
  id?: number;
};
