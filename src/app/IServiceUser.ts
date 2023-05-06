import { IActionResult, IUser } from "@etsoo/appscript";

/**
 * Service user interface
 */
export interface IServiceUser extends IUser {
  /**
   * Service device id
   */
  serviceDeviceId: string;

  /**
   * Service passphrase encrypted
   */
  servicePassphrase: string;
}

/**
 * Service user login result
 */
export type ServiceLoginResult<U extends IServiceUser = IServiceUser> =
  IActionResult<U>;
