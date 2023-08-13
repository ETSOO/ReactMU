import { IActionResult, IUser } from "@etsoo/appscript";

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
   */
  readonly organizationName: string;

  /**
   * Service device id
   */
  readonly serviceDeviceId: string;

  /**
   * Service passphrase encrypted
   */
  readonly servicePassphrase: string;
}

/**
 * Service user login result
 */
export type ServiceLoginResult<U extends IServiceUser = IServiceUser> =
  IActionResult<U>;
