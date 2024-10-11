import {
  ApiRefreshTokenDto,
  AuthApi,
  BridgeUtils,
  ExternalEndpoint,
  IApi
} from "@etsoo/appscript";
import { IServiceApp } from "./IServiceApp";
import { IServiceAppSettings } from "./IServiceAppSettings";
import { IServicePageData } from "./IServicePage";
import { IServiceUser, ServiceUserToken } from "./IServiceUser";
import { ReactApp } from "./ReactApp";

const coreName = "core";

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
   */
  loadCore() {
    if (BridgeUtils.host == null) {
      globalThis.location.href = this.coreEndpoint.webUrl;
    } else {
      BridgeUtils.host.loadApp(coreName);
    }
  }

  /**
   * Go to the login page
   * @param tryLogin Try to login again
   * @param removeUrl Remove current URL for reuse
   */
  override toLoginPage(tryLogin?: boolean, removeUrl?: boolean) {
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
        url = url.addUrlParam("tryLogin", tryLogin ?? false);

        // Is it inside an iframe?
        if (globalThis.self !== globalThis.parent) {
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
   * User login extended
   * @param user New user
   * @param refreshToken Refresh token
   * @param keep Keep in local storage or not
   * @param dispatch User state dispatch
   */
  override userLogin(
    user: U,
    refreshToken: string,
    keep?: boolean,
    dispatch?: boolean
  ): void {
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
    super.userLogin(user, refreshToken, keep, dispatch);
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
    keep?: boolean,
    dispatch?: boolean
  ) {
    // User login
    const { refreshToken } = user;
    this.userLogin(user, refreshToken, keep, dispatch);

    // Core system login
    core ??= {
      refreshToken,
      accessToken: user.token,
      tokenType: user.tokenScheme ?? "Bearer",
      expiresIn: user.seconds
    };

    this.exchangeTokenAll(core, coreName);
  }
}
