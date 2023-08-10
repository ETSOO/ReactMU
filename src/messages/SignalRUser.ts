import { UserRole } from "@etsoo/appscript";

/**
 * SignalR user
 */
export type SignalRUser = {
  /**
   * Id
   * 编号
   */
  id: number;

  /**
   * Name
   * 姓名
   */
  name: string;

  /**
   * Avatar
   * 头像
   */
  avatar?: string;

  /**
   * Device id
   * 设备编号
   */
  deviceId: number | number[];

  /**
   * Role
   * 角色
   */
  role?: UserRole;
};
