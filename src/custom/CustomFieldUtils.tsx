import {
  CustomFieldData,
  CustomFieldRef,
  CustomFieldSpace
} from "@etsoo/appscript";
import { CustomFieldReactCollection, ICustomFieldReact } from "@etsoo/react";
import { IdType, ListType2 } from "@etsoo/shared";
import React from "react";
import { FieldCheckbox } from "./FieldCheckbox";
import { FieldAmountLabel } from "./FieldAmountLabel";
import { FieldDateInput } from "./FieldDateInput";
import { FieldDivider } from "./FieldDivider";
import { FieldCombobox } from "./FieldCombobox";
import { FieldInput } from "./FieldInput";
import { FieldLabel } from "./FieldLabel";
import { FieldNumberInput } from "./FieldNumberInput";
import { FieldTexarea } from "./FieldTexarea";
import { FieldJson } from "./FieldJson";
import { FieldRadio } from "./FieldRadio";
import { FieldSelect } from "./FieldSelect";
import { FieldSwitch } from "./FieldSwitch";
import { ResponsiveStyleValue } from "../ResponsiveStyleValue";
import Grid, { GridSize } from "@mui/material/Grid";
import Typography, { TypographyProps } from "@mui/material/Typography";

/**
 * Custom field utilities
 */
export namespace CustomFieldUtils {
  /**
   * Custom field creators
   */
  export const customFieldCreators: Record<
    string,
    ICustomFieldReact<any> | undefined
  > = {
    amountlabel: FieldAmountLabel,
    checkbox: FieldCheckbox,
    combobox: FieldCombobox,
    date: FieldDateInput,
    divider: FieldDivider,
    input: FieldInput,
    json: FieldJson,
    label: FieldLabel,
    number: FieldNumberInput,
    radio: FieldRadio,
    select: FieldSelect,
    switch: FieldSwitch,
    textarea: FieldTexarea
  };

  /**
   * Create layout
   * @param fields Fields
   * @param collections Ref collections
   * @param getValue Get default value callback
   * @param onChange Callback for value change
   * @param globalCallback Global label callback, can be repeated
   * @param fieldCalback Field callback
   * @returns
   */
  export function create<D extends CustomFieldData = CustomFieldData>(
    fields: D[],
    collections: CustomFieldReactCollection<D>,
    getValue: (field: D) => unknown,
    onChange: (name: string, value: unknown) => void,
    globalCallback?: (input: string) => string,
    fieldCalback?: (field: D) => void
  ) {
    return fields.map((field, index) => {
      // Global callback for labels
      if (globalCallback) {
        if (field.label) field.label = globalCallback(field.label);
        if (field.helperText)
          field.helperText = globalCallback(field.helperText);
        if (field.mainSlotProps)
          updateProperties(field.mainSlotProps, globalCallback);
      }

      // Field callback for each field
      if (fieldCalback) fieldCalback(field);

      const creator = customFieldCreators[field.type];
      if (creator == null) {
        return (
          <Grid
            key={index}
            size={transformSpace(field.space)}
            {...field.gridItemProps}
          >
            {`Type ${field.type} is not supported currently`}
          </Grid>
        );
      }

      const Creator = creator;
      const mref = React.createRef<CustomFieldRef<unknown>>();

      let ui: JSX.Element | string = (
        <Creator
          field={field}
          mref={mref}
          onChange={onChange}
          defaultValue={getValue(field)}
        />
      );

      const name = field.name;
      if (name) {
        if (collections[name] == null) {
          collections[name] = [mref, field];
        } else {
          ui = `Duplicate custom field ${name}`;
        }
      }

      return (
        <Grid
          key={name ?? index}
          size={transformSpace(field.space)}
          {...field.gridItemProps}
        >
          {ui}
        </Grid>
      );
    });
  }

  /**
   * Create multiline label
   * @param label Original label
   * @param props Properties
   * @returns Result
   */
  export function createMultilineLabel(
    label?: string,
    props?: TypographyProps
  ) {
    return label?.split("\n").map((line, index) => (
      <Typography component="div" key={index} {...props}>
        {line}
      </Typography>
    ));
  }

  /**
   * Transform custom field space
   * @param space Space
   * @returns Result
   */
  export function transformSpace(space?: CustomFieldSpace) {
    const size: ResponsiveStyleValue<GridSize> =
      space === "full"
        ? { xs: 12 }
        : space === "quater"
        ? { sm: 12, md: 6, lg: 3 }
        : space === "five"
        ? { sm: 12, md: 5 }
        : space === "seven"
        ? { sm: 12, md: 7 }
        : space === "half1"
        ? { xs: 12, sm: 6 }
        : { sm: 12, md: 6 };
    return size;
  }

  /**
   * Update ref options
   * @param fields Fields
   * @param callback Callback
   */
  export function updateOptions(
    fields: CustomFieldData[],
    callback: (key: string, ids: IdType[]) => ListType2[]
  ) {
    fields.forEach((field) => {
      if (field.refs == null || field.refs.length < 2) return;
      const key = field.refs[0];
      const ids = field.refs.slice(1);
      field.options = callback(key, ids);
    });
  }

  /**
   * Update properties
   * @param input Input object
   * @param globalCallback Global callback
   */
  export function updateProperties(
    input: object,
    globalCallback: (input: string) => string
  ) {
    for (const key in input) {
      const value = Reflect.get(input, key);
      if (typeof value === "string") {
        Reflect.set(input, key, globalCallback(value));
      } else if (typeof value === "object" && value != null) {
        updateProperties(value, globalCallback);
      }
    }
  }
}
