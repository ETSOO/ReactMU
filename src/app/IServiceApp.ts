import { ApiRefreshTokenDto, IApi, IApiPayload } from "@etsoo/appscript";
import { ReactAppData, ReactAppType } from "./ReactApp";
import { IServiceUser, ServiceUserToken } from "./IServiceUser";
import { IActionResult } from "@etsoo/shared";
import React from "react";

/**
 * Service application context
 */
export const ServiceAppContext =
  React.createContext<ReactAppData<IServiceApp> | null>(null);

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
   * @param tryLogin Try login or not
   */
  loadCore(tryLogin?: boolean): void;

  /**
   * Switch organization
   * @param organizationId Organization ID
   * @param fromOrganizationId From organization ID
   * @param payload Payload
   */
  switchOrg(
    organizationId: number,
    fromOrganizationId?: number,
    payload?: IApiPayload<IActionResult<IServiceUser & ServiceUserToken>>
  ): Promise<IActionResult<IServiceUser & ServiceUserToken> | undefined>;

  /**
   *
   * @param user Current user
   * @param core Core system API token data
   * @param dispatch User state dispatch
   */
  userLoginEx(
    user: IServiceUser & ServiceUserToken,
    core?: ApiRefreshTokenDto,
    dispatch?: boolean
  ): void;
}
