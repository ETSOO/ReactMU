import { ApiRefreshTokenDto, IApi } from "@etsoo/appscript";
import { ReactAppType } from "./ReactApp";
import { IServiceUser, ServiceUserToken } from "./IServiceUser";

/**
 * Service application interface
 */
export interface IServiceApp extends ReactAppType {
  /**
   * Core system API
   */
  readonly coreApi: IApi;

  /**
   * Core system origin
   */
  readonly coreOrigin: string;

  /**
   * Load core system UI
   */
  loadCore(): void;

  /**
   *
   * @param user Current user
   * @param core Core system API token data
   * @param keep Keep in local storage or not
   * @param dispatch User state dispatch
   */
  userLoginEx(
    user: IServiceUser & ServiceUserToken,
    core?: ApiRefreshTokenDto,
    keep?: boolean,
    dispatch?: boolean
  ): void;
}
