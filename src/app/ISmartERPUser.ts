import { IActionResult, IUser } from '@etsoo/appscript';

/**
 * SmartERP user interface
 */
export interface ISmartERPUser extends IUser {
    /**
     * Service refresh token
     */
    readonly serviceToken?: string;
}

/**
 * SmartERP user login result
 */
export type SmartERPLoginResult = IActionResult<ISmartERPUser>;
