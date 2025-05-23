import React from "react";
import {
  DataTypes,
  IdDefaultType,
  LabelDefaultType,
  ListType
} from "@etsoo/shared";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

/**
 * Item list properties
 */
export interface ItemListProps<
  T extends object,
  D extends DataTypes.Keys<T>,
  L extends DataTypes.Keys<T, string>
> {
  /**
   * Button label
   */
  buttonLabel?: React.ReactNode;

  /**
   * Style class name
   */
  className?: string;

  /**
   * Keep click for all items
   */
  keepClick?: boolean;

  /**
   * Id field name
   */
  idField?: D;

  /**
   * Label field name or callback
   */
  labelField?: L | ((item: T) => string);

  /**
   * Minimum width
   */
  minWidth?: number | string;

  /**
   * Button icon
   */
  icon?: React.ReactNode;

  /**
   * Button color
   */
  color?: "inherit" | "primary" | "secondary";

  /**
   * Close event
   */
  onClose?(item: T | undefined, changed: boolean): void;

  /**
   * Current selected id
   */
  selectedValue?: T[D];

  /**
   * Button size
   */
  size?: "small" | "medium" | "large";

  /**
   * Title
   */
  title?: string;

  /**
   * Items
   */
  items: T[];

  /**
   * Button variant
   */
  variant?: "text" | "outlined" | "contained";
}

/**
 * Item list component
 * @param props Properties
 */
export function ItemList<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: ItemListProps<T, D, L>) {
  //  properties destructure
  const {
    buttonLabel,
    className,
    color = "primary",
    keepClick = false,
    items,
    idField = "id" as D,
    labelField = "label" as L,
    minWidth,
    icon,
    onClose,
    selectedValue,
    size = "medium",
    title,
    variant = "outlined"
  } = props;

  // Get label
  const getLabel = (item: T): string => {
    if (typeof labelField === "function") {
      return labelField(item);
    } else {
      return DataTypes.convert(item[labelField], "string") ?? "";
    }
  };

  // Dialog open or not state
  const [open, setOpen] = React.useState(false);

  // Default state
  const defaultItem: T | undefined = items.find(
    (item) => item[idField] === selectedValue
  );

  // Current item
  const [currentItem, setCurrentItem] = React.useState(defaultItem);

  // Click handler
  const clickHandler = () => {
    if (
      items.length < 1 ||
      (items.length === 1 && !keepClick && defaultItem != null)
    ) {
      return;
    }

    // Open the dialog
    setOpen(true);
  };

  // Close handler
  const closeHandler = () => {
    if (!open) return;

    // Close the dialog
    setOpen(false);

    // Emit close event
    if (onClose) {
      onClose(currentItem, false);
    }
  };

  // Close item handler
  const closeItemHandler = (item: T) => {
    if (!keepClick) {
      // Update the current item
      setCurrentItem(item);
    }

    // Close the dialog
    setOpen(false);

    // Emit close event
    if (onClose) {
      onClose(item, true);
    }
  };

  return (
    <>
      <Button
        className={className}
        variant={variant}
        startIcon={icon}
        color={color}
        size={size}
        onClick={clickHandler}
      >
        {buttonLabel ?? (currentItem ? getLabel(currentItem) : undefined)}
      </Button>
      <Dialog aria-labelledby="dialog-title" open={open} onClose={closeHandler}>
        {title && <DialogTitle id="dialog-title">{title}</DialogTitle>}
        <DialogContent sx={{ minWidth }}>
          <List>
            {items.map((item) => {
              const id = item[idField];
              return (
                <ListItemButton
                  key={id as unknown as React.Key}
                  disabled={
                    id === (currentItem ? currentItem[idField] : undefined) &&
                    !keepClick
                  }
                  onClick={() => closeItemHandler(item)}
                >
                  <ListItemText>{getLabel(item)}</ListItemText>
                </ListItemButton>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
