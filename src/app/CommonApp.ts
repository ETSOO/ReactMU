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
   * Do user login
   * @param data User data
   * @param refreshToken Refresh token
   * @param keep Keep login
   * @returns Success data
   */
  protected doUserLogin(
    data: U,
    refreshToken: string,
    keep: boolean
  ): string | undefined {
    this.userLogin(data, refreshToken, keep);
    return undefined;
  }

  /**
   * Refresh token
   * @param props Props
   */
  override async refreshToken<D extends object = Partial<RefreshTokenRQ>>(
    props?: RefreshTokenProps<D>
  ) {
    // Destruct
    const {
      callback,
      data,
      relogin = false,
      showLoading = false
    } = props ?? {};

    // Token
    const token = this.getCacheToken();
    if (token == null || token === "") {
      if (callback) callback(false);
      return false;
    }

    // Reqest data
    const rq: RefreshTokenRQ = {
      deviceId: this.deviceId,
      region: this.region,
      timezone: this.getTimeZone(),
      ...data
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
      failCallback?: (result: RefreshTokenResult, serviceToken?: string) => void
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
      var successData = this.doUserLogin(result.data, refreshToken, keep);

      // Callback
      if (failCallback) failCallback(true, successData);

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
      if (result.type === "TokenExpired" && relogin) {
        // Try login
        // Dialog to receive password
        var labels = this.getLabels("reloginTip", "login");
        this.notifier.prompt(
          labels.reloginTip,
          async (pwd) => {
            if (pwd == null) {
              this.toLoginPage();
              return;
            }

            // Set password for the action
            rq.pwd = this.encrypt(this.hash(pwd));

            // Submit again
            const result = await this.api.put<LoginResult>(
              "Auth/RefreshToken",
              rq,
              payload
            );

            if (result == null) return;

            if (result.ok) {
              success(result, (loginResult: RefreshTokenResult) => {
                if (loginResult === true) {
                  if (callback) callback(true);
                  return;
                }

                const message = this.formatRefreshTokenResult(loginResult);
                if (message) this.notifier.alert(message);
              });
              return;
            }

            // Popup message
            this.alertResult(result);
            return false;
          },
          labels.login,
          { type: "password" }
        );

        // Fake truth to avoid reloading
        return true;
      }

      if (callback) callback(result);
      return false;
    }

    return success(result, callback);
  }

  /**
   * Try login
   * @param data Additional data
   * @param showLoading Show loading bar or not
   * @returns Result
   */
  override async tryLogin<D extends object = RefreshTokenRQ>(
    data?: D,
    showLoading?: boolean
  ) {
    // Reset user state
    const result = await super.tryLogin(data);
    if (!result) return false;

    // Refresh token
    return await this.refreshToken({
      callback: (result) => this.doRefreshTokenResult(result),
      data,
      showLoading,
      relogin: true
    });
  }
}
