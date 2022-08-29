import { IAppSettings } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';

/**
 * Service app settings interface
 */
export interface IServiceAppSettings<S extends DataTypes.IdType = number>
    extends IAppSettings {
    /**
     * Service id
     */
    readonly serviceId: S;
}
