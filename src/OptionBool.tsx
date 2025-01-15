import { ListType1 } from "@etsoo/shared";
import { useAppContext } from "./app/ReactApp";
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
  // Global app
  const app = useAppContext();

  // Options
  const options = app?.getBools() ?? [];

  // Layout
  return (
    <OptionGroup<ListType1> options={options} row multiple={false} {...props} />
  );
}
