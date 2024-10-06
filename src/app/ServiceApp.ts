import { BridgeUtils, ExternalEndpoint, IApi } from "@etsoo/appscript";
import { IServiceApp } from "./IServiceApp";
import { IServiceAppSettings } from "./IServiceAppSettings";
import { IServicePageData } from "./IServicePage";
import { IServiceUser } from "./IServiceUser";
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

    // Make sure apply new device id for new login
    this.clearDeviceId();

    //  Get the redirect URL
    this.api
      .get<string>("Auth/GetLogInUrl", {
        region: this.region,
        device: this.deviceId
      })
      .then((url) => {
        if (!url) return;

        url += `?tryLogin=${tryLogin ?? false}`;

        if (BridgeUtils.host == null) {
          globalThis.location.href = url;
        } else {
          BridgeUtils.host.loadApp(coreName, url);
        }
      });
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
    // Super call, set token
    super.userLogin(user, refreshToken, keep, dispatch);

    if (user.passphrase) {
      // Save the passphrase
      const passphrase = this.decrypt(
        user.passphrase,
        `${user.uid}-${this.settings.appId}`
      );
      if (passphrase) this.updatePassphrase(passphrase);
    }
  }
}
