import { IAppSettings, IUser } from "@etsoo/appscript";
import { CoreConstants, IPageData } from "@etsoo/react";
import { ReactApp } from "./ReactApp";

/**
 * Common independent application
 * 通用独立程序
 */
export abstract class CommonApp<
  U extends IUser = IUser,
  P extends IPageData = IPageData,
  S extends IAppSettings = IAppSettings
> extends ReactApp<S, U, P> {
  /**
   * Override persistedFields
   */
  protected override get persistedFields() {
    return [...super.persistedFields, CoreConstants.FieldUserIdSaved];
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
