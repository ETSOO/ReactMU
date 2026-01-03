import { DataTypes, IdType } from "@etsoo/shared";
import Checkbox from "@mui/material/Checkbox";
import List, { ListProps } from "@mui/material/List";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText, { ListItemTextProps } from "@mui/material/ListItemText";
import React from "react";

type ListItemLabel<T extends object> =
  | DataTypes.Keys<T, string | undefined>
  | ((item: T) => string | undefined);

/**
 * List multipler component props
 */
export type ListMultiplerProps<T extends object> = ListProps & {
  /**
   * List data
   */
  data: T[];

  /**
   * Id field name
   */
  idField: DataTypes.Keys<T, IdType>;

  /**
   * Primary label field name or function
   */
  primaryLabel: ListItemLabel<T>;

  /**
   * Secondary label field name or function
   */
  secondaryLabel?: ListItemLabel<T>;

  /**
   * List item props
   */
  listItemProps?: ListItemProps;

  /**
   * List item text props
   */
  listItemTextProps?: Omit<ListItemTextProps, "primary" | "secondary">;

  /**
   * Input name
   */
  name?: string;

  /**
   * On change event
   * @param items The selected items
   * @param ids The selected IDs
   */
  onCheckItems?: (items: T[], ids: unknown[]) => void;
};

function GetListItemLabel<T extends object>(data: T, label?: ListItemLabel<T>) {
  if (label == null) return undefined;
  if (typeof label === "function") {
    return label(data);
  } else {
    return data[label] as string | undefined;
  }
}

/**
 * List multipler component
 * @param props Props
 * @returns Component
 */
export function ListMultipler<T extends object>(props: ListMultiplerProps<T>) {
  // Destruct
  const {
    data,
    idField,
    primaryLabel,
    secondaryLabel,
    listItemProps,
    listItemTextProps,
    name,
    onCheckItems,
    ...rest
  } = props;

  // Refs
  const initialized = React.useRef(false);
  React.useEffect(() => {
    initialized.current = true;
  }, []);

  // State
  const [checked, setChecked] = React.useState<T[]>([]);

  const ids = React.useMemo(() => {
    const ids = checked.map((u) => u[idField]);

    if (onCheckItems && initialized.current) {
      onCheckItems(checked, ids);
    }

    return ids;
  }, [checked]);

  function handleToggle(id: T[DataTypes.Keys<T, IdType>]) {
    if (ids.includes(id)) {
      setChecked((prev) => prev.filter((u) => u[idField] !== id));
    } else {
      const item = data.find((u) => u[idField] === id);
      if (item) {
        setChecked((prev) => [...prev, item]);
      }
    }
  }

  const inputType = typeof ids[0] === "string" ? "text" : "number";

  // Layout
  return (
    <List {...rest}>
      {name && (
        <input
          type={inputType}
          style={{ display: "none", width: 1 }}
          name={name}
          value={ids.join(",")}
          readOnly
        />
      )}
      {data.map((u) => (
        <ListItem key={`${u[idField]}`} {...listItemProps}>
          <ListItemButton dense onClick={() => handleToggle(u[idField])}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                disableRipple
                checked={ids.includes(u[idField])}
              />
            </ListItemIcon>
            <ListItemText
              primary={GetListItemLabel(u, primaryLabel)}
              secondary={GetListItemLabel(u, secondaryLabel)}
              {...listItemTextProps}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
