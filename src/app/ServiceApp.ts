import {
  BridgeUtils,
  createClient,
  IActionResult,
  IApi,
  IApiPayload,
  RefreshTokenProps,
  RefreshTokenResult,
  RefreshTokenRQ
} from "@etsoo/appscript";
import { CoreConstants } from "@etsoo/react";
import { DomUtils } from "@etsoo/shared";
import { IServiceApp } from "./IServiceApp";
import { IServiceAppSettings } from "./IServiceAppSettings";
import { IServicePageData } from "./IServicePage";
import { IServiceUser, ServiceLoginResult } from "./IServiceUser";
import { ISmartERPUser } from "./ISmartERPUser";
import { ReactApp } from "./ReactApp";

/**
 * Core Service App
 * Service login to core system, get the refesh token and access token
 * Use the acess token to the service api, get a service access token
 * Use the new acess token and refresh token to login
 */
export class ServiceApp<
    U extends IServiceUser = IServiceUser,
    P extends IServicePageData = IServicePageData,
    S extends IServiceAppSettings = IServiceAppSettings
  >
  extends ReactApp<S, ISmartERPUser, P>
  implements IServiceApp
{
  /**
   * Service API
   */
  readonly serviceApi: IApi;

  private _serviceUser?: U;
  /**
   * Service user
   */
  get serviceUser() {
    return this._serviceUser;
  }
  protected set serviceUser(value: U | undefined) {
    this._serviceUser = value;
  }

  /**
   * Service passphrase
   */
  protected servicePassphrase: string = "";

  /**
   * Constructor
   * @param settings Settings
   * @param name Application name
   */
  constructor(settings: S, name: string) {
    super(settings, name);

    // Check
    if (settings.serviceId == null || settings.serviceEndpoint == null) {
      throw new Error("No service settings");
    }

    // Service API
    const api = createClient();
    this.setApi(api);

    // Fix the baseUrl done by setupApi (Default is the settings.endpoint)
    api.baseUrl = settings.serviceEndpoint;

    this.serviceApi = api;
  }

  /**
   * Load SmartERP core
   */
  loadSmartERP() {
    if (BridgeUtils.host == null) {
      window.location.href = this.settings.webUrl;
    } else {
      BridgeUtils.host.loadApp("core");
    }
  }

  /**
   * Go to the login page
   * @param tryLogin Try to login again
   */
  override toLoginPage(tryLogin?: boolean) {
    const parameters = `?serviceId=${this.settings.serviceId}&${
      DomUtils.CultureField
    }=${this.culture}${tryLogin ? "" : "&tryLogin=false"}`;

    // Make sure apply new device id for new login
    this.clearDeviceId();

    if (BridgeUtils.host == null) {
      const coreUrl = this.settings.webUrl;
      window.location.href = coreUrl + parameters;
    } else {
      BridgeUtils.host.loadApp("core", parameters);
    }
  }

  /**
   * Refresh token
   * @param props Props
   */
  override async refreshToken<D extends object = RefreshTokenRQ>(
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
    // Merge additional data passed
    const rq: RefreshTokenRQ = {
      deviceId: this.deviceId,
      timezone: this.getTimeZone(),
      ...data
    };

    // Login result type
    type LoginResult = IActionResult<U>;

    // Payload
    const payload: IApiPayload<LoginResult, any> = {
      showLoading,
      config: { headers: { [CoreConstants.TokenHeaderRefresh]: token } },
      onError: (error) => {
        if (callback) callback(error);

        // Prevent further processing
        return false;
      }
    };

    // Success callback
    const success = async (
      result: LoginResult,
      failCallback?: (result: RefreshTokenResult) => void
    ) => {
      // Token
      const refreshToken = this.getResponseToken(payload.response);
      if (refreshToken == null || result.data == null) {
        if (failCallback) failCallback(this.get("noData")!);
        return false;
      }

      // User data
      const userData = result.data;

      // Use core system access token to service api to exchange service access token
      const serviceResult = await this.serviceApi.put<ServiceLoginResult<U>>(
        "Auth/ExchangeToken",
        {
          token: this.encryptEnhanced(
            userData.token,
            this.settings.serviceId.toString()
          )
        },
        {
          showLoading,
          onError: (error) => {
            if (failCallback) failCallback(error);

            // Prevent further processing
            return false;
          }
        }
      );

      if (serviceResult == null) return false;

      if (!serviceResult.ok) {
        if (failCallback) failCallback(serviceResult);
        return false;
      }

      if (serviceResult.data == null) {
        if (failCallback) failCallback(this.get("noData")!);
        return false;
      }

      // Login
      this.userLoginEx(userData, refreshToken, serviceResult.data);

      // Success callback
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
              await success(result, (loginResult: RefreshTokenResult) => {
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

    return await success(result, callback);
  }

  /**
   * Service decrypt message
   * @param messageEncrypted Encrypted message
   * @param passphrase Secret passphrase
   * @returns Pure text
   */
  serviceDecrypt(messageEncrypted: string, passphrase?: string) {
    return this.decrypt(messageEncrypted, passphrase ?? this.servicePassphrase);
  }

  /**
   * Service encrypt message
   * @param message Message
   * @param passphrase Secret passphrase
   * @param iterations Iterations, 1000 times, 1 - 99
   * @returns Result
   */
  serviceEncrypt(message: string, passphrase?: string, iterations?: number) {
    return this.encrypt(
      message,
      passphrase ?? this.servicePassphrase,
      iterations
    );
  }

  /**
   * Try login
   * @param data Additional data
   * @param showLoading Show loading bar or not
   * @returns Result
   */
  override async tryLogin<D extends object = {}>(
    data?: D,
    showLoading?: boolean
  ) {
    // Reset user state
    const result = await super.tryLogin(data, showLoading);
    if (!result) return false;

    // Refresh token
    return await this.refreshToken({
      callback: (result) => this.doRefreshTokenResult(result),
      data,
      showLoading,
      relogin: true
    });
  }

  /**
   * User login extended
   * @param user Core system user
   * @param refreshToken Refresh token
   * @param serviceUser Service user
   */
  userLoginEx(user: ISmartERPUser, refreshToken: string, serviceUser: U) {
    // Service user login
    this.servicePassphrase =
      this.decrypt(
        serviceUser.servicePassphrase,
        this.settings.serviceId.toString()
      ) ?? "";

    // Service user
    this.serviceUser = serviceUser;

    // Service API token
    this.serviceApi.authorize(this.settings.authScheme, serviceUser.token);

    // Keep = true, means service could hold the refresh token for long access
    // Trigger Context change and serviceUser is ready then
    super.userLogin(user, refreshToken, true);
  }
}
