import { IActionResult, IUser } from "@etsoo/appscript";

/**
 * SmartERP user interface
 */
export interface ISmartERPUser extends IUser {
  /**
   * Global user id
   * 全局用户编号
   */
  readonly uid?: string;

  /**
   * Service refresh token
   * 服务刷新令牌
   */
  readonly serviceToken?: string;
}

/**
 * SmartERP user login result
 */
export type SmartERPLoginResult = IActionResult<ISmartERPUser>;
