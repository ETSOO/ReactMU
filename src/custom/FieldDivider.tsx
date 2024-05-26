import { ICustomFieldReact } from "@etsoo/react";
import { Divider } from "@mui/material";
import React from "react";
import { CustomFieldUtils } from "./CustomFieldUtils";

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
