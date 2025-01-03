import {
  ApiRefreshTokenDto,
  AppLoginParams,
  AppTryLoginParams,
  AuthApi,
  BridgeUtils,
  ExternalEndpoint,
  IApi,
  IApiPayload
} from "@etsoo/appscript";
import { IServiceApp } from "./IServiceApp";
import { IServiceAppSettings } from "./IServiceAppSettings";
import { IServicePageData } from "./IServicePage";
import { IServiceUser, ServiceUserToken } from "./IServiceUser";
import { ReactApp } from "./ReactApp";
import { IActionResult } from "@etsoo/shared";

const coreName = "core";
const coreTokenKey = "core-refresh-token";
const tryLoginKey = "tryLogin";

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
  extends ReactApp<S, U, P>
  implements IServiceApp
{
  /**
   * Core endpoint
   */
  protected coreEndpoint: ExternalEndpoint;

  /**
   * Core system API
   */
  readonly coreApi: IApi;

  /**
   * Core system origin
   */
  readonly coreOrigin: string;

  private coreAccessToken: string | undefined;

  /**
   * Constructor
   * @param settings Settings
   * @param name Application name
   * @param debug Debug mode
   */
  constructor(settings: S, name: string, debug: boolean = false) {
    super(settings, name, debug);

    const coreEndpoint = settings.endpoints?.core;
    if (coreEndpoint == null) {
      throw new Error("Core API endpont is required.");
    }
    this.coreEndpoint = coreEndpoint;
    this.coreOrigin = new URL(coreEndpoint.webUrl).origin;
    this.coreApi = this.createApi(coreName, coreEndpoint);
  }

  /**
   * Load core system UI
   * @param tryLogin Try login or not
   */
  loadCore(tryLogin: boolean = false) {
    if (BridgeUtils.host == null) {
      let url = this.coreEndpoint.webUrl;
      if (!tryLogin) url = url.addUrlParam(tryLoginKey, tryLogin);
      globalThis.location.href = url;
    } else {
      const startUrl = tryLogin
        ? undefined
        : "".addUrlParam(tryLoginKey, tryLogin);
      BridgeUtils.host.loadApp(coreName, startUrl);
    }
  }

  /**
   * Go to the login page
   * @param data Login parameters
   */
  override toLoginPage(data?: AppLoginParams) {
    // Destruct
    const { removeUrl, showLoading, params } = data ?? {};

    // Cache current URL
    this.cachedUrl = removeUrl ? undefined : globalThis.location.href;

    //  Get the redirect URL
    new AuthApi(this)
      .getLogInUrl({
        region: this.region,
        device: this.deviceId
      })
      .then((url) => {
        if (!url) return;

        // Add try login flag
        if (params != null) {
          url = url.addUrlParams(params);
        }

        // Is it embeded?
        if (this.embedded) {
          globalThis.parent.postMessage(["login", url], this.coreOrigin);
        } else {
          if (BridgeUtils.host == null) {
            globalThis.location.href = url;
          } else {
            BridgeUtils.host.loadApp(coreName, url);
          }
        }
      });

    // Make sure apply new device id for new login
    this.clearDeviceId();
  }

  /**
   * Signout, with userLogout and toLoginPage
   * @param action Callback
   */
  override signout(action?: () => void | boolean) {
    // Clear core token
    this.storage.setData(coreTokenKey, undefined);

    // Super call
    return super.signout(action);
  }

  /**
   * User login extended
   * @param user New user
   * @param refreshToken Refresh token
   * @param dispatch User state dispatch
   */
  override userLogin(user: U, refreshToken: string, dispatch?: boolean): void {
    if (user.clientDeviceId && user.passphrase) {
      // Save the passphrase
      // Interpolated string expressions are different between TypeScript and C# for the null value
      const passphrase = this.decrypt(
        user.passphrase,
        `${user.uid ?? ""}-${this.settings.appId}`
      );
      if (passphrase) {
        this.deviceId = user.clientDeviceId;
        this.updatePassphrase(passphrase);
      }
    }

    // Super call, set token
    super.userLogin(user, refreshToken, dispatch);
  }

  /**
   *
   * @param user Current user
   * @param core Core system API token data
   * @param keep Keep in local storage or not
   * @param dispatch User state dispatch
   */
  userLoginEx(
    user: U & ServiceUserToken,
    core?: ApiRefreshTokenDto,
    dispatch?: boolean
  ) {
    // User login
    const { refreshToken } = user;
    this.userLogin(user, refreshToken, dispatch);

    // Core system login
    core ??= {
      refreshToken,
      accessToken: user.token,
      tokenType: user.tokenScheme ?? "Bearer",
      expiresIn: user.seconds
    };

    // Cache the core system data
    this.saveCoreToken(core);
  }

  /**
   * Save core system data
   * @param data Data
   */
  protected saveCoreToken(data: ApiRefreshTokenDto) {
    // Hold the core system access token
    this.coreAccessToken = data.accessToken;

    // Cache the core system refresh token
    this.storage.setData(coreTokenKey, this.encrypt(data.refreshToken));

    // Exchange tokens
    this.exchangeTokenAll(data, coreName);
  }

  /**
   * Switch organization
   * @param organizationId Organization ID
   * @param fromOrganizationId From organization ID
   * @param payload Payload
   */
  async switchOrg(
    organizationId: number,
    fromOrganizationId?: number,
    payload?: IApiPayload<IActionResult<U & ServiceUserToken>>
  ) {
    if (!this.coreAccessToken) {
      throw new Error("Core access token is required to switch organization.");
    }

    const [result, refreshToken] = await new AuthApi(
      this,
      this.coreApi
    ).switchOrg(
      { organizationId, fromOrganizationId, token: this.coreAccessToken },
      payload
    );

    if (result == null) return;

    if (!result.ok) {
      return result;
    }

    if (result.data == null) {
      throw new Error("Invalid switch organization result.");
    }

    let core: ApiRefreshTokenDto | undefined;
    if ("core" in result.data && typeof result.data.core === "string") {
      core = JSON.parse(result.data.core);
      delete result.data.core;
    }

    // Override the user data's refresh token
    const user = refreshToken ? { ...result.data, refreshToken } : result.data;

    // User login
    this.userLoginEx(user, core, true);

    return result;
  }

  /**
   * Try login
   * @param params Login parameters
   */
  override async tryLogin(params?: AppTryLoginParams) {
    // Destruct
    params ??= {};
    let { onFailure, onSuccess, ...rest } = params;

    if (onFailure == null) {
      onFailure = params.onFailure = () => {
        this.toLoginPage(rest);
      };
    }

    // Check core system token
    const coreToken = this.storage.getData<string>(coreTokenKey);
    if (!coreToken) {
      onFailure();
      return false;
    }

    const coreTokenDecrypted = this.decrypt(coreToken);
    if (!coreTokenDecrypted) {
      onFailure();
      return false;
    }

    params.onSuccess = () => {
      // Call the core system API refresh token
      this.apiRefreshTokenData(this.coreApi, {
        token: coreTokenDecrypted,
        appId: this.settings.appId
      }).then((data) => {
        if (data == null) return;

        // Cache the core system refresh token
        this.saveCoreToken(data);

        onSuccess?.();
      });
    };

    return await super.tryLogin(params);
  }
}
