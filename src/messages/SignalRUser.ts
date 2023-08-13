import { UserRole } from "@etsoo/appscript";

/**
 * SignalR user
 */
export type SignalRUser = {
  /**
   * Global id, not local system user id
   * 全局用户编号，不是子系统用户编号
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
  deviceId: number;

  /**
   * Role
   * 角色
   */
  role?: UserRole;
};
