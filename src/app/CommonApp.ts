import { IAppSettings, IUser } from "@etsoo/appscript";
import { CoreConstants } from "@etsoo/react";
import { ReactApp } from "./ReactApp";

/**
 * Common independent application
 * 通用独立程序
 */
export abstract class CommonApp<
  U extends IUser = IUser,
  S extends IAppSettings = IAppSettings
> extends ReactApp<S, U> {
  /**
   * Constructor
   * @param settings Settings
   * @param name Application name
   * @param debug Debug mode
   */
  constructor(settings: S, name: string, debug: boolean = false) {
    super(settings, name, debug);

    // Add persisted fields
    this.persistedFields.push(CoreConstants.FieldUserIdSaved);
  }

  /**
   * Init call update fields in local storage
   * @returns Fields
   */
  protected override initCallEncryptedUpdateFields(): string[] {
    const fields = super.initCallEncryptedUpdateFields();
    fields.push(CoreConstants.FieldUserIdSaved);
    return fields;
  }
}
