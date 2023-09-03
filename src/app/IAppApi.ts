import { IApi } from "@etsoo/restclient";
import { ISmartERPUser } from "./ISmartERPUser";
import { RefreshTokenRQ } from "@etsoo/appscript";

/**
 * Service application API, Implement interface calls between different services
 * 服务程序接口，实现不同服务之间的接口调用
 */
export interface IAppApi {
  /**
   * API
   */
  readonly api: IApi<any>;

  /**
   * Service id
   */
  readonly serviceId: number;

  /**
   * Is once authorized
   */
  get onceAuthorized(): boolean;

  /**
   * Authorize the API
   * @param user SmartERP user
   * @param refreshToken SmartERP user refresh token
   * @param token Access token
   */
  authorize(user: ISmartERPUser, refreshToken: string, token: string): void;

  /**
   * Get refresh token data
   */
  getrefreshTokenData(): Partial<RefreshTokenRQ>;
}