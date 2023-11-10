import { IUser } from "@etsoo/appscript";
import { IActionResult } from "@etsoo/shared";

/**
 * SmartERP user interface
 */
export interface ISmartERPUser extends IUser {
  /**
   * Global user GUID
   * 全局用户GUID编号
   */
  readonly uid: string;

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
