import { IAppSettings } from "@etsoo/appscript";
import { IdType } from "@etsoo/shared";

/**
 * Service app settings interface
 */
export interface IServiceAppSettings<S extends IdType = number>
  extends IAppSettings {
  /**
   * Service id
   */
  readonly serviceId: S;
}
