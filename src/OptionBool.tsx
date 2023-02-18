import { ListType1 } from "@etsoo/shared";
import React from "react";
import { globalApp } from "./app/ReactApp";
import { OptionGroup, OptionGroupProps } from "./OptionGroup";

/**
 * OptionBool props
 */
export type OptionBoolProps = Omit<
  OptionGroupProps<ListType1, "id", "label">,
  "options" | "row" | "multiple"
>;

/**
 * OptionBool (yes/no)
 * @param props Props
 * @returns Component
 */
export function OptionBool(props: OptionBoolProps) {
  // Options
  const options = globalApp.getBools();

  // Layout
  return (
    <OptionGroup<ListType1> options={options} row multiple={false} {...props} />
  );
}
