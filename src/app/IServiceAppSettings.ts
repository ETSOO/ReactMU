import { IAppSettings } from "@etsoo/appscript";

/**
 * Service app settings interface
 */
export interface IServiceAppSettings extends IAppSettings {
  /**
   * Application id
   * 程序编号
   */
  appId: number;
}
