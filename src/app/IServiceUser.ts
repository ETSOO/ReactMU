import { IUser } from "@etsoo/appscript";
import { IActionResult } from "@etsoo/shared";

/**
 * Service user interface
 */
export interface IServiceUser extends IUser {
  /**
   * Global user id
   * 全局用户编号
   */
  readonly uid: string;

  /**
   * Organization name
   * 机构名称
   */
  readonly organizationName: string;

  /**
   * Service (App) passphrase encrypted
   * 服务（应用）加密密钥
   */
  readonly passphrase?: string;
}

/**
 * Service user login result
 */
export type ServiceLoginResult<U extends IServiceUser = IServiceUser> =
  IActionResult<U>;
