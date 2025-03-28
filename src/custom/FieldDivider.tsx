import { ICustomFieldReact } from "@etsoo/react";
import React from "react";
import { CustomFieldUtils } from "./CustomFieldUtils";
import Divider from "@mui/material/Divider";

/**
 * Divider field creator
 * type: divider
 * @returns Component
 */
export const FieldDivider: ICustomFieldReact<unknown> = ({ field }) => {
  return (
    <React.Fragment>
      {CustomFieldUtils.createMultilineLabel(field.label)}
      <Divider {...field.mainSlotProps} />
    </React.Fragment>
  );
};
