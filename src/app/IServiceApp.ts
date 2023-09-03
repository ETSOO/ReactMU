import { IApi, RefreshTokenResult } from "@etsoo/appscript";
import { IServiceUser } from "./IServiceUser";
import { ReactAppType } from "./ReactApp";
import { IAppApi } from "./IAppApi";

/**
 * Service application interface
 */
export interface IServiceApp extends ReactAppType {
  /**
   * Service API
   */
  readonly serviceApi: IApi;

  /**
   * Service user
   */
  readonly serviceUser?: IServiceUser;

  /**
   * Service application API login
   * @param appApi Service application API
   * @param callback Callback
   */
  apiLogin(
    appApi: IAppApi,
    callback?: (result: RefreshTokenResult, successData?: string) => void
  ): Promise<boolean>;

  /**
   * Load SmartERP core
   */
  loadSmartERP(): void;

  /**
   * Service decrypt message
   * @param messageEncrypted Encrypted message
   * @param passphrase Secret passphrase
   * @returns Pure text
   */
  serviceDecrypt(
    messageEncrypted: string,
    passphrase?: string
  ): string | undefined;

  /**
   * Service encrypt message
   * @param message Message
   * @param passphrase Secret passphrase
   * @param iterations Iterations, 1000 times, 1 - 99
   * @returns Result
   */
  serviceEncrypt(
    message: string,
    passphrase?: string,
    iterations?: number
  ): string | undefined;
}
