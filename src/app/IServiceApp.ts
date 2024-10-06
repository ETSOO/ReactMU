import { IApi } from "@etsoo/appscript";
import { ReactAppType } from "./ReactApp";

/**
 * Service application interface
 */
export interface IServiceApp extends ReactAppType {
  /**
   * Core system API
   */
  readonly coreApi: IApi;

  /**
   * Load core system UI
   */
  loadCore(): void;
}
