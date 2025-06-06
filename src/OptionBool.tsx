import { ListType1 } from "@etsoo/shared";
import { useAppContext } from "./app/ReactApp";
import { OptionGroup, OptionGroupProps } from "./OptionGroup";
import { MUGlobal } from "./MUGlobal";

/**
 * OptionBool props
 */
export type OptionBoolProps = Omit<
  OptionGroupProps<ListType1, "id", "label">,
  "options" | "row" | "multiple" | "defaultValue" | "onValueChange"
> & {
  /**
   * Default value
   */
  defaultValue?: boolean;

  /**
   * On value change handler
   */
  onValueChange?: (value?: boolean) => void;
};

/**
 * OptionBool (yes/no)
 * @param props Props
 * @returns Component
 */
export function OptionBool(props: OptionBoolProps) {
  // Destruct
  const {
    defaultValue = false,
    onValueChange,
    variant = MUGlobal.inputFieldVariant,
    ...rest
  } = props;

  // Global app
  const app = useAppContext();

  // Options
  const options = app?.getBools() ?? [];

  // Layout
  return (
    <OptionGroup
      options={options}
      row
      multiple={false}
      variant={variant}
      defaultValue={defaultValue.toString()}
      onValueChange={(value) => {
        if (onValueChange) {
          const v =
            value == "true" ? true : value == "false" ? false : undefined;
          onValueChange(v);
        }
      }}
      {...rest}
    />
  );
}
