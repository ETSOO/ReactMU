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
   * Service passphrase
   */
  protected servicePassphrase: string = "";

  /**
   * Constructor
   * @param settings Settings
   * @param name Application name
   * @param debug Debug mode
   */
  constructor(settings: S, name: string, debug: boolean = false) {
    super(settings, name, debug);

    // Check
    if (settings.appId == null) {
      throw new Error("Service Application ID is required.");
    }

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

    // Set service passphrase
    this.servicePassphrase =
      this.decrypt(
        user.servicePassphrase,
        `${user.uid}-${this.settings.appId}`
      ) ?? "";
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
}
