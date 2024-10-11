import {
  IApiPayload,
  IAppSettings,
  IUser,
  RefreshTokenProps,
  RefreshTokenResult,
  RefreshTokenRQ
} from "@etsoo/appscript";
import { CoreConstants, IPageData } from "@etsoo/react";
import { ReactApp } from "./ReactApp";
import { IActionResult } from "@etsoo/shared";

/**
 * Common independent application
 * 通用独立程序
 */
export abstract class CommonApp<
  U extends IUser = IUser,
  P extends IPageData = IPageData,
  S extends IAppSettings = IAppSettings
> extends ReactApp<S, U, P> {
  /**
   * Override persistedFields
   */
  protected override get persistedFields() {
    return [...super.persistedFields, CoreConstants.FieldUserIdSaved];
  }

  /**
   * Init call update fields in local storage
   * @returns Fields
   */
  protected override initCallEncryptedUpdateFields(): string[] {
    const fields = super.initCallEncryptedUpdateFields();
    fields.push(CoreConstants.FieldUserIdSaved);
    return fields;
  }

  /**
   * Refresh token
   * @param props Props
   */
  override async refreshToken(props?: RefreshTokenProps) {
    // Destruct
    const { callback, showLoading = false } = props ?? {};

    // Token
    const token = this.getCacheToken();
    if (token == null || token === "") {
      if (callback) callback(false);
      return false;
    }

    // Reqest data
    const rq: RefreshTokenRQ = {
      deviceId: this.deviceId
    };

    // Login result type
    type LoginResult = IActionResult<U>;

    // Payload
    const payload: IApiPayload<LoginResult, any> = {
      // No loading bar needed to avoid screen flicks
      showLoading,
      config: { headers: { [CoreConstants.TokenHeaderRefresh]: token } },
      onError: (error) => {
        if (callback) callback(error);

        // Prevent further processing
        return false;
      }
    };

    // Success callback
    const success = (
      result: LoginResult,
      failCallback?: (result: RefreshTokenResult) => void
    ) => {
      // Token
      const refreshToken = this.getResponseToken(payload.response);
      if (refreshToken == null || result.data == null) {
        if (failCallback) failCallback(this.get("noData")!);
        return false;
      }

      // Keep
      const keep = this.storage.getData(CoreConstants.FieldLoginKeep, false);

      // User login
      this.userLogin(result.data, refreshToken, keep);

      // Callback
      if (failCallback) failCallback(true);

      return true;
    };

    // Call API
    const result = await this.api.put<LoginResult>(
      "Auth/RefreshToken",
      rq,
      payload
    );

    if (result == null) return false;

    if (!result.ok) {
      // Remove the wrong token
      this.clearCacheToken();

      // Callback
      if (callback) callback(result);

      return false;
    }

    return success(result, callback);
  }

  /**
   * Try login
   * @param showLoading Show loading bar or not
   * @returns Result
   */
  override async tryLogin(showLoading?: boolean) {
    // Reset user state
    const result = await super.tryLogin(showLoading);
    if (!result) return false;

    // Refresh token
    return await this.refreshToken({
      callback: (result) => this.doRefreshTokenResult(result),
      showLoading
    });
  }
}
