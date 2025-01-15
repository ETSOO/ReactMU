import { ListType1, Utils } from "@etsoo/shared";
import { SelectEx, SelectExProps } from "./SelectEx";
import { useAppContext } from "./app/ReactApp";

/**
 * SelectBool props
 */
export type SelectBoolProps = Omit<
  SelectExProps<ListType1>,
  "options" | "loadData"
>;

/**
 * SelectBool (yes/no)
 * @param props Props
 * @returns Component
 */
export function SelectBool(props: SelectBoolProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const { search = true, autoAddBlankItem = search, ...rest } = props;

  // Options
  const options = app?.getBools() ?? [];

  if (autoAddBlankItem) Utils.addBlankItem(options);

  // Layout
  return <SelectEx<ListType1> options={options} search={search} {...rest} />;
}
